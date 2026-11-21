export const CATEGORIES = ['Credenciales/IDs', 'Electrónica/Calculadoras', 'Mochilas/Papelería', 'Ropa/Accesorios', 'Termos', 'Otros'] as const;
export type Category = typeof CATEGORIES[number];
export type ItemStatus = 'pending' | 'available' | 'claimed' | 'delivered';
export interface UserSession { studentId: string; name: string }
export interface Comment { id: string; author: string; text: string; createdAt: string }
export interface Ticket { id: string; itemId: string; studentId: string; name: string; createdAt: string; expiresAt: string; status: 'active' | 'delivered' | 'expired' }
export interface Item { id: string; title: string; description: string; location: string; category: Category; image?: string; status: ItemStatus; reporterId: string; reporterName: string; createdAt: string; comments: Comment[]; ticketId?: string; expiresAt?: string; receiveCode?: string; qrToken?: string }
export interface LogEntry { id: string; itemId: string; itemTitle: string; category: Category; reporterId: string; reporterName: string; claimantId: string; claimantName: string; ticketCode: string; deliveredAt: string }
export interface RegisteredUser { studentId: string; name: string; createdAt: string }
export interface DeviceBinding { studentId: string; deviceId: string; ip?: string }
export interface Database { items: Item[]; tickets: Ticket[]; logs: LogEntry[]; matriculasRegistry: Record<string, RegisteredUser>; deviceBindings: DeviceBinding[] }
