import { useState, type FormEvent } from 'react';
import { IdCard, UserRound } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { validateAndBindIdentity } from '../../services/antiAbuseGuard';
import type { UserSession } from '../../types';

export function LoginModal({ onClose, onLogin }: { onClose: () => void; onLogin: (user: UserSession) => Promise<string | null> }) {
  const [studentId, setId] = useState('');
  const [givenNames, setGivenNames] = useState('');
  const [paternalSurname, setPaternalSurname] = useState('');
  const [maternalSurname, setMaternalSurname] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d{7}$/.test(studentId)) return setError('La matrícula debe tener 7 dígitos.');
    if (!givenNames.trim() || !paternalSurname.trim()) return setError('Escribe tu(s) nombre(s) y primer apellido.');

    const fullName = [givenNames.trim(), paternalSurname.trim(), maternalSurname.trim()].filter(Boolean).join(' ');
    const identity = validateAndBindIdentity(studentId, fullName);
    if (!identity.ok) return setError(identity.error ?? 'No se pudo validar la matrícula.');

    setBusy(true);
    setError('');
    try {
      const problem = await onLogin({ studentId: studentId.trim(), name: fullName });
      if (problem) { setError(problem); return; }
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return <Modal title="Ingresar con matrícula" onClose={onClose}>
    <form onSubmit={submit} className="form-stack">
      <p className="muted">Inicia sesión para reportar hallazgos y reclamar objetos.</p>
      <label>Matrícula *
        <div className="input-icon"><IdCard size={17}/><input autoFocus lang="es" spellCheck inputMode="numeric" autoComplete="off" maxLength={7} value={studentId} onChange={event => setId(event.target.value.replace(/\D/g, ''))} placeholder="Ej. 1945321"/></div>
      </label>
      <label>Nombre(s) *<div className="input-icon"><UserRound size={17}/><input lang="es" spellCheck autoComplete="given-name" value={givenNames} onChange={event => setGivenNames(event.target.value)} placeholder="Ej. Carlos Tomás"/></div></label>
      <label>Primer apellido *<input lang="es" spellCheck autoComplete="family-name" value={paternalSurname} onChange={event => setPaternalSurname(event.target.value)} placeholder="Ej. Cárdenas"/></label>
      <label>Apellido materno (opcional)<input lang="es" spellCheck autoComplete="additional-name" value={maternalSurname} onChange={event => setMaternalSurname(event.target.value)} placeholder="Ej. López"/></label>
      {error && <p className="error-text">{error}</p>}
      <button className="button button-primary button-full" disabled={busy}>{busy ? 'Validando…' : 'Continuar'}</button>
      <small className="muted">Si guardaste tu perfil de contacto en Chrome/Google, el autocompletado del navegador puede rellenar estos campos. La app no solicita ni utiliza tu contraseña de Google.</small>
    </form>
  </Modal>;
}
