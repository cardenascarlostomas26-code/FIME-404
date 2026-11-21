import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { MainLayout } from './layouts/MainLayout';
import { PrefecturaLayout } from './layouts/PrefecturaLayout';
import { Feed } from './features/feed/Feed';
import { ReportModal } from './features/report/ReportModal';
import { ReceiptModal } from './features/report/ReceiptModal';
import { LoginModal } from './features/claim/LoginModal';
import { TicketModal } from './features/claim/TicketModal';
import { ProfileModal } from './features/profile/ProfileModal';
import { CategoryGuide } from './features/guide/CategoryGuide';
import { MapModal } from './features/map/MapModal';
import { Modal } from './components/ui/Modal';
import { localDb } from './services/localDb';
import type { Item, Ticket, UserSession } from './types';
import bearLogo from './assets/fime-404-bear.png';
const Prefectura = lazy(() => import('./features/prefectura/Prefectura'));

export default function App() {
  const [db, setDb] = useState(() => localDb.get());
  const [user, setUser] = useState<UserSession | null>(() => { try { return JSON.parse(localStorage.getItem('encontrapp-user') || 'null') as UserSession | null; } catch { return null; } });
  const [adminEntry, setAdminEntry] = useState(() => window.location.pathname === '/prefectura-admin');
  const [admin, setAdmin] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [login, setLogin] = useState(false);
  const [report, setReport] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [pinError, setPinError] = useState('');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [ticketTitle, setTicketTitle] = useState('');
  const [pendingClaim, setPendingClaim] = useState<Item | null>(null);
  const [profile, setProfile] = useState(false);
  const [guide, setGuide] = useState(false);
  const [map, setMap] = useState(false);
  const [receipt, setReceipt] = useState<Item | null>(null);

  const refresh = useCallback(() => { localDb.cleanupExpiredReports(); localDb.expireTickets(); setDb(localDb.get()); }, []);
  useEffect(() => { const unsubscribe = localDb.subscribe(refresh); refresh(); const timer = window.setInterval(refresh, 30000); return () => { unsubscribe(); window.clearInterval(timer); }; }, [refresh]);
  useEffect(() => { const handle = (event: Event) => { const detail = (event as CustomEvent<{ id: string; text: string }>).detail; if (user) localDb.comment(detail.id, detail.text, user); }; window.addEventListener('encontrapp:comment', handle); return () => window.removeEventListener('encontrapp:comment', handle); }, [user]);
  useEffect(() => {
    const route = () => {
      const enteringAdmin = window.location.pathname === '/prefectura-admin';
      setAdminEntry(enteringAdmin);
      setAdmin(false);
      setPinValue('');
      setPinError('');
    };
    const shortcut = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        history.pushState({}, '', '/prefectura-admin');
        setAdminEntry(true);
        setAdmin(false);
        setPinValue('');
        setPinError('');
      }
    };
    window.addEventListener('popstate', route);
    window.addEventListener('keydown', shortcut);
    return () => { window.removeEventListener('popstate', route); window.removeEventListener('keydown', shortcut); };
  }, []);

  const claim = (item: Item) => { if (!user) { setPendingClaim(item); setLogin(true); return; } const created = localDb.claim(item.id, user); if (created) { setTicket(created); setTicketTitle(item.title); } refresh(); };
  const loginUser = async (next: UserSession): Promise<string | null> => {
    let deviceId = localStorage.getItem('encontrapp-device-id');
    if (!deviceId) { deviceId = crypto.randomUUID(); localStorage.setItem('encontrapp-device-id', deviceId); }
    let ip: string | undefined;
    try { const controller = new AbortController(); const timeout = window.setTimeout(() => controller.abort(), 2500); const response = await fetch('https://api.ipify.org?format=json', { signal: controller.signal }); window.clearTimeout(timeout); if (response.ok) { const data = await response.json() as { ip?: string }; ip = data.ip; } } catch { /* Device ID remains the local fallback when IP lookup is unavailable. */ }
    const problem = localDb.registerIdentity(next, deviceId, ip);
    if (problem) return problem;
    localStorage.setItem('encontrapp-user', JSON.stringify(next)); setUser(next);
    if (pendingClaim) { const created = localDb.claim(pendingClaim.id, next); if (created) { setTicket(created); setTicketTitle(pendingClaim.title); } setPendingClaim(null); refresh(); }
    return null;
  };
  const checkPin = () => { if (pinValue === '1234') { setAdmin(true); setQuery(''); } else setPinError('PIN incorrecto.'); };
  const closeAdminGate = () => { setAdminEntry(false); setAdmin(false); setPinValue(''); setPinError(''); if (window.location.pathname === '/prefectura-admin') history.pushState({}, '', '/'); };
  const logout = () => { localStorage.removeItem('encontrapp-user'); setUser(null); setProfile(false); };

  if (adminEntry) return <PrefecturaLayout>
    {admin ? <Suspense fallback={<main className="admin-page loading-screen"><img src={bearLogo} alt=""/><b>FIME 404</b><span>Abriendo el panel seguro…</span></main>}><Prefectura db={db} onModerate={(id, approve) => { localDb.moderate(id, approve); refresh(); }} onAuthorize={(id, credential) => localDb.authorizeReceipt(id, credential)} onDeliver={(code, student) => localDb.deliver(code, student)} onRefresh={refresh} exportCsv={() => localDb.exportLogs()} onRelease={id => { localDb.releaseClaim(id); refresh(); }}/></Suspense> : <Modal title="Acceso de Prefectura" onClose={closeAdminGate}><div className="form-stack"><div className="admin-login-icon"><ShieldCheck size={24}/></div><p className="muted center">Acceso exclusivo para personal autorizado de Prefectura.</p><label>PIN de acceso<div className="input-icon"><KeyRound size={17}/><input autoFocus type="password" lang="es" spellCheck inputMode="numeric" maxLength={4} value={pinValue} onChange={event => setPinValue(event.target.value.replace(/\D/g, ''))} placeholder="••••" onKeyDown={event => { if (event.key === 'Enter') checkPin(); }}/></div></label>{pinError && <p className="error-text">{pinError}</p>}<button className="button button-primary button-full" onClick={checkPin}>Entrar al panel</button></div></Modal>}
  </PrefecturaLayout>;

  return <MainLayout user={user} query={query} onQuery={setQuery} onLogin={() => setLogin(true)} onReport={() => user ? setReport(true) : setLogin(true)} onMap={() => setMap(true)} onGuide={() => setGuide(true)} onProfile={() => setProfile(true)}>
    <Feed items={db.items} query={query} category={category} onCategory={setCategory} onDetails={() => {}} onClaim={claim} onMap={() => setMap(true)} onGuide={() => setGuide(true)} user={user} onLogin={() => setLogin(true)}/>
    {login && <LoginModal onClose={() => { setLogin(false); setPendingClaim(null); }} onLogin={loginUser}/>}
    {report && user && <ReportModal user={user} onClose={() => setReport(false)} onGuide={() => setGuide(true)} onMap={() => setMap(true)} onCreate={data => { const item = localDb.addItem(data, user); refresh(); return item; }}/>}
    {ticket && <TicketModal ticket={ticket} itemTitle={ticketTitle} onClose={() => setTicket(null)}/>}
    {profile && user && <ProfileModal db={db} user={user} onClose={() => setProfile(false)} onReceipt={item => setReceipt(item)} onLogout={logout}/>}
    {receipt && <ReceiptModal item={receipt} compact onClose={() => setReceipt(null)}/>}
    {guide && <CategoryGuide onClose={() => setGuide(false)}/>}
    {map && <MapModal onClose={() => setMap(false)}/>}
  </MainLayout>;
}
