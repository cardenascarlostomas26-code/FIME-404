import type { Category, Database, Item, LogEntry, Ticket, UserSession } from '../types';

const KEY = 'encontrapp-fime-v1';
const ago = (hours: number) => new Date(Date.now() - hours * 3600000).toISOString();
const seed: Database = {
  items: [
    { id: 'seed-1', title: 'Calculadora científica Casio', description: 'Calculadora negra, modelo fx-991LA X. Tiene una pequeña calcomanía azul en la parte trasera.', location: 'Salón 3204 · Edificio 3', category: 'Electrónica/Calculadoras', image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=900&q=80', status: 'available', reporterId: '2045187', reporterName: 'Mariana López', createdAt: ago(3), comments: [{ id: 'c1', author: 'Luis R.', text: '¿La encontraron después de la clase de circuitos?', createdAt: ago(2) }] },
    { id: 'seed-2', title: 'Termo verde olivo', description: 'Termo de acero inoxidable, tapa negra. Estaba en una de las mesas del área común.', location: 'Biblioteca · planta baja', category: 'Termos', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80', status: 'available', reporterId: '1983021', reporterName: 'Diego Martínez', createdAt: ago(8), comments: [] },
    { id: 'seed-3', title: 'Credencial universitaria', description: 'Credencial encontrada junto a las máquinas expendedoras. Se resguarda en Prefectura.', location: 'Pasillo · Edificio 2', category: 'Credenciales/IDs', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80', status: 'available', reporterId: '2014578', reporterName: 'Ana Sofía Ruiz', createdAt: ago(26), comments: [] },
    { id: 'seed-4', title: 'Mochila negra', description: 'Mochila negra con una libreta cuadriculada y estuche azul en el compartimento frontal.', location: 'Polideportivo · gradas', category: 'Mochilas/Papelería', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80', status: 'claimed', reporterId: '1934882', reporterName: 'Carlos Garza', createdAt: ago(30), comments: [], ticketId: 'FIME-8492' },
    { id: 'seed-5', title: 'Lentes de armazón', description: 'Armazón negro, estuche rígido gris. Encontrados al terminar la clase.', location: 'Edificio 7 · aula 7101', category: 'Ropa/Accesorios', status: 'available', reporterId: '2056281', reporterName: 'Fernanda Cruz', createdAt: ago(48), comments: [] }
  ],
  tickets: [{ id: 'FIME-8492', itemId: 'seed-4', studentId: '1945321', name: 'Alex Hernández', createdAt: ago(1), expiresAt: new Date(Date.now() + 23 * 3600000).toISOString(), status: 'active' }],
  logs: [], matriculasRegistry: {}, deviceBindings: []
};

function read(): Database {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Database>;
      const rows=parsed.items??seed.items;const usedCodes=rows.map(item=>item.receiveCode??'');
      const items = rows.map(item => {
        if (item.status !== 'pending') return item;
        const receiveCode=item.receiveCode??newCode(usedCodes);if(!item.receiveCode)usedCodes.push(receiveCode);
        return { ...item, expiresAt: item.expiresAt ?? new Date(new Date(item.createdAt).getTime() + 3 * 3600000).toISOString(), receiveCode, qrToken: item.qrToken ?? `FIME404:${crypto.randomUUID()}` };
      });
      const database={ ...structuredClone(seed), ...parsed, items, tickets: parsed.tickets ?? seed.tickets, logs: parsed.logs ?? [], matriculasRegistry: parsed.matriculasRegistry ?? {}, deviceBindings: parsed.deviceBindings ?? [] };
      const migrated=JSON.stringify(database);if(migrated!==raw)localStorage.setItem(KEY,migrated);
      return database;
    }
  } catch { /* Recover from malformed local data */ }
  localStorage.setItem(KEY, JSON.stringify(seed));
  return structuredClone(seed);
}
function write(db: Database) { localStorage.setItem(KEY, JSON.stringify(db)); window.dispatchEvent(new Event('encontrapp:update')); }
function normalizedName(name: string) { return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es-MX'); }
function newCode(used: string[]) { let code = ''; do { code = `FIME-${Math.floor(1000 + Math.random() * 9000)}`; } while (used.includes(code)); return code; }

export const localDb = {
  get: () => read(),
  subscribe(callback: () => void) { window.addEventListener('encontrapp:update', callback); window.addEventListener('storage', callback); return () => { window.removeEventListener('encontrapp:update', callback); window.removeEventListener('storage', callback); }; },
  registerIdentity(user: UserSession, deviceId: string, ip?: string) {
    const db = read();
    const existing = db.matriculasRegistry[user.studentId];
    if (existing && normalizedName(existing.name) !== normalizedName(user.name)) return 'La matrícula ya está registrada con otro nombre. Verifica que coincida con tu registro original.';
    const conflict = db.deviceBindings.some(binding => (binding.deviceId === deviceId || Boolean(ip && binding.ip === ip)) && binding.studentId !== user.studentId);
    if (conflict) return 'Este dispositivo/red ya está vinculado a otra matrícula universitaria.';
    if (!existing) db.matriculasRegistry[user.studentId] = { studentId: user.studentId, name: user.name.trim().replace(/\s+/g, ' '), createdAt: new Date().toISOString() };
    const binding = db.deviceBindings.find(entry => entry.deviceId === deviceId);
    if (binding) { binding.ip = ip ?? binding.ip; } else db.deviceBindings.push({ studentId: user.studentId, deviceId, ...(ip ? { ip } : {}) });
    write(db); return null;
  },
  addItem(input: Pick<Item, 'title' | 'description' | 'location' | 'category' | 'image' | 'images'>, user: UserSession) {
    const db = read(); const createdAt = new Date();
    const item: Item = { ...input, id: crypto.randomUUID(), status: 'pending', reporterId: user.studentId, reporterName: user.name, createdAt: createdAt.toISOString(), expiresAt: new Date(createdAt.getTime() + 3 * 3600000).toISOString(), receiveCode: newCode(db.items.map(x => x.receiveCode ?? '')), qrToken: `FIME404:${crypto.randomUUID()}`, comments: [] };
    db.items.unshift(item); write(db); return item;
  },
  authorizeReceipt(id: string, credential: string) {
    const db = read(); const item = db.items.find(value => value.id === id);
    if (!item || item.status !== 'pending' || !item.expiresAt || new Date(item.expiresAt).getTime() <= Date.now()) return false;
    if (credential !== item.qrToken && credential.toLowerCase() !== item.receiveCode?.toLowerCase()) return false;
    item.status = 'available'; write(db); return true;
  },
  cleanupExpiredReports() { const db = read(); const length = db.items.length; db.items = db.items.filter(item => !(item.status === 'pending' && item.expiresAt && new Date(item.expiresAt).getTime() <= Date.now())); if (db.items.length !== length) write(db); },
  moderate(id: string, approve: boolean) { const db = read(); db.items = approve ? db.items.map(item => item.id === id ? { ...item, status: 'available' } : item) : db.items.filter(item => item.id !== id); write(db); },
  releaseClaim(itemId: string) { const db=read();const item=db.items.find(value=>value.id===itemId);if(!item||item.status!=='claimed')return;const ticket=db.tickets.find(value=>value.id===item.ticketId&&value.status==='active');if(ticket)ticket.status='expired';item.status='available';delete item.ticketId;write(db); },
  comment(itemId: string, text: string, user: UserSession) { const db = read(); const item = db.items.find(x => x.id === itemId); if (!item) return; item.comments.push({ id: crypto.randomUUID(), author: user.name, text, createdAt: new Date().toISOString() }); write(db); },
  claim(itemId: string, user: UserSession) { const db = read(); const item = db.items.find(x => x.id === itemId); if (!item || item.status !== 'available') return null; const ticket: Ticket = { id: newCode(db.tickets.map(x => x.id)), itemId, studentId: user.studentId, name: user.name, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString(), status: 'active' }; item.status = 'claimed'; item.ticketId = ticket.id; db.tickets.unshift(ticket); write(db); return ticket; },
  deliver(ticketCode: string, studentId: string) { const db = read(); const ticket = db.tickets.find(t => t.id.toLowerCase() === ticketCode.trim().toLowerCase() && t.studentId === studentId.trim() && t.status === 'active' && new Date(t.expiresAt).getTime() > Date.now()); if (!ticket) return false; const item = db.items.find(x => x.id === ticket.itemId); if (!item) return false; ticket.status = 'delivered'; item.status = 'delivered'; db.logs.unshift({ id: crypto.randomUUID(), itemId: item.id, itemTitle: item.title, category: item.category, reporterId: item.reporterId, reporterName: item.reporterName, claimantId: ticket.studentId, claimantName: ticket.name, ticketCode: ticket.id, deliveredAt: new Date().toISOString() } satisfies LogEntry); write(db); return true; },
  expireTickets() { const db = read(); let changed = false; for (const ticket of db.tickets) if (ticket.status === 'active' && new Date(ticket.expiresAt).getTime() <= Date.now()) { ticket.status = 'expired'; const item = db.items.find(x => x.id === ticket.itemId); if (item?.status === 'claimed') { item.status = 'available'; delete item.ticketId; } changed = true; } if (changed) write(db); },
  exportLogs() { const { logs } = read(); const cols = ['Objeto','Categoría','Matrícula reportante','Nombre reportante','Matrícula reclamante','Nombre reclamante','Código de validación','Fecha de entrega']; const rows = logs.map(l => [l.itemTitle,l.category,l.reporterId,l.reporterName,l.claimantId,l.claimantName,l.ticketCode,new Date(l.deliveredAt).toLocaleString('es-MX')]); return [cols,...rows].map(row => row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n'); }
};
export type { Category };
