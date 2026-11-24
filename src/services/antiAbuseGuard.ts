export const MAX_REPORTS_PER_WINDOW = 3;
export const WINDOW_MS = 3 * 60 * 60 * 1000;

const DEVICE_ID_KEY = 'fime404_device_id';
const REPORT_TIMESTAMPS_KEY = 'fime404_report_timestamps';
const MATRICULA_BINDINGS_KEY = 'fime404_matricula_bindings';

type IdentityBinding = { fullName: string; deviceId: string; updatedAt: number };

function readTimestamps(): number[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(REPORT_TIMESTAMPS_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((timestamp): timestamp is number => Number.isFinite(timestamp)) : [];
  } catch {
    return [];
  }
}

function readBindings(): Record<string, IdentityBinding> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(MATRICULA_BINDINGS_KEY) ?? '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, IdentityBinding> : {};
  } catch {
    return {};
  }
}

function normalizedName(fullName: string) {
  return fullName.trim().replace(/\s+/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-MX');
}

export function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = globalThis.crypto?.randomUUID?.() ?? `fime404-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export function getRemainingReportTimestamps(now = Date.now()): number[] {
  const remaining = readTimestamps().filter(timestamp => now - timestamp < WINDOW_MS);
  localStorage.setItem(REPORT_TIMESTAMPS_KEY, JSON.stringify(remaining));
  return remaining;
}

export function checkReportRateLimit(now = Date.now()): { allowed: boolean; count: number; remaining: number; retryAfterMs: number } {
  const timestamps = getRemainingReportTimestamps(now);
  const count = timestamps.length;
  const allowed = count < MAX_REPORTS_PER_WINDOW;
  const oldestTimestamp = Math.min(...timestamps);
  const retryAfterMs = allowed ? 0 : Math.max(0, oldestTimestamp + WINDOW_MS - now);
  return { allowed, count, remaining: Math.max(0, MAX_REPORTS_PER_WINDOW - count), retryAfterMs };
}

export function recordReportSubmission(now = Date.now()): void {
  const timestamps = getRemainingReportTimestamps(now);
  timestamps.push(now);
  localStorage.setItem(REPORT_TIMESTAMPS_KEY, JSON.stringify(timestamps));
}

export function validateAndBindIdentity(matricula: string, fullName: string): { ok: boolean; error?: string; deviceId: string } {
  const deviceId = getOrCreateDeviceId();
  const normalizedMatricula = matricula.trim();
  const originalName = fullName.trim();

  if (!/^\d{7}$/.test(normalizedMatricula)) {
    return { ok: false, error: 'La matrícula debe tener 7 dígitos.', deviceId };
  }
  if (normalizedName(originalName).length < 3) {
    return { ok: false, error: 'Escribe tu nombre completo.', deviceId };
  }

  const bindings = readBindings();
  const existing = bindings[normalizedMatricula];
  if (existing && normalizedName(existing.fullName) !== normalizedName(originalName)) {
    return { ok: false, error: 'Esta matrícula ya está asociada a otro nombre registrado en este entorno', deviceId };
  }

  bindings[normalizedMatricula] = { fullName: originalName, deviceId, updatedAt: Date.now() };
  localStorage.setItem(MATRICULA_BINDINGS_KEY, JSON.stringify(bindings));
  return { ok: true, deviceId };
}
