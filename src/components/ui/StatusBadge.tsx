import type { ItemStatus } from '../../types';
const labels: Record<ItemStatus, string> = { pending: 'Pendiente de entrega', available: 'En Prefectura', claimed: 'Apartado', delivered: 'Entregado / Recuperado' };
export function StatusBadge({ status }: { status: ItemStatus }) { return <span className={`badge status-${status}`}><i/>{labels[status]}</span>; }
