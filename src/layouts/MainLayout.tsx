import { useState, type ReactNode } from 'react';
import { BookOpen, CircleUserRound, Compass, MapPinned, Plus, Search } from 'lucide-react';
import bearLogo from '../assets/fime-404-bear.png';
import { Modal } from '../components/ui/Modal';
import type { UserSession } from '../types';

type Props = { children: ReactNode; user: UserSession | null; query: string; onQuery: (value: string) => void; onLogin: () => void; onReport: () => void; onMap: () => void; onGuide: () => void; onProfile: () => void };

export function MainLayout({ children, user, query, onQuery, onLogin, onReport, onMap, onGuide, onProfile }: Props) {
  const [menu, setMenu] = useState(false);
  const [quickTools, setQuickTools] = useState(false);
  const openProfile = () => user ? onProfile() : onLogin();
  const explore = () => document.getElementById('feed-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return <div className="app-shell">
    <header className="navbar"><div className="nav-inner">
      <button className="brand" onClick={explore} aria-label="FIME 404, ir al inicio"><span className="brand-mark"><img src={bearLogo} alt=""/></span><span>FIME <b>404</b><small>OBJETOS PERDIDOS · UANL</small></span></button>
      <div className="nav-search"><Search size={17}/><input lang="es" spellCheck value={query} onChange={event => onQuery(event.target.value)} placeholder="Buscar objetos, lugares…"/></div>
      <div className="nav-actions">
        <button className="button button-outline nav-button" onClick={onReport} aria-label="Reportar hallazgo"><Plus size={16}/><span>Reportar hallazgo</span></button>
        <button className="map-nav-link" onClick={onMap} aria-label="Ver mapa de FIME"><MapPinned size={16}/><span>Mapa FIME</span></button>
        <div className="profile-wrap"><button className={`profile-button ${user ? 'logged' : ''}`} onClick={() => user ? onProfile() : setMenu(!menu)} aria-label={user ? `Mi actividad, matrícula terminación ${user.studentId.slice(-3)}` : 'Ingresar con matrícula'}>{user ? <><span className="profile-avatar">{user.name.split(' ').map(part => part[0]).slice(0, 2).join('')}</span><span className="profile-id">••{user.studentId.slice(-3)}</span><span className="profile-open">Mi actividad</span></> : <><CircleUserRound size={18}/><span>Ingresar</span></>}</button>{menu && <div className="profile-menu"><button onClick={() => { onLogin(); setMenu(false); }}><CircleUserRound size={15}/> Ingresar con matrícula</button></div>}</div>
      </div>
    </div></header>
    {children}
    <footer className="footer"><span className="brand-mini"><img src={bearLogo} alt=""/> FIME 404</span><span>Una iniciativa para que nada se quede perdido. · FIME UANL</span><span>Hecho para la comunidad 🐯</span></footer>
    <nav className="bottom-nav" aria-label="Navegación principal"><button onClick={explore} aria-label="Explorar"><Compass size={20}/><span>Explorar</span></button><button className="bottom-report" onClick={onReport} aria-label="Reportar un hallazgo"><span><Plus size={21}/></span><span>Reportar</span></button><button onClick={() => setQuickTools(true)} aria-label="Abrir mapa y guía"><MapPinned size={20}/><span>Mapa / Guía</span></button><button onClick={openProfile} aria-label="Abrir mi perfil"><CircleUserRound size={20}/><span>Mi Perfil</span></button></nav>
    {quickTools && <Modal title="Accesos de FIME 404" onClose={() => setQuickTools(false)}><div className="quick-tools"><button className="button button-outline" onClick={() => { setQuickTools(false); onMap(); }}><MapPinned size={18}/> Ver Mapa de FIME</button><button className="button button-outline" onClick={() => { setQuickTools(false); onGuide(); }}><BookOpen size={18}/> Guía de categorías</button></div></Modal>}
  </div>;
}
