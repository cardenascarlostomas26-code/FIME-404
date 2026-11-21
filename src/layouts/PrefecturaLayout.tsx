import type { ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';
import bearLogo from '../assets/fime-404-bear.png';

export function PrefecturaLayout({ children }: { children: ReactNode }) {
  return <div className="prefectura-shell">
    <header className="prefectura-navbar">
      <div className="prefectura-brand"><span className="brand-mark"><img src={bearLogo} alt=""/></span><span>FIME <b>404</b><small>PREFECTURA · VENTANILLA</small></span></div>
      <span className="prefectura-session"><ShieldCheck size={16}/> Personal autorizado</span>
    </header>
    {children}
    <footer className="prefectura-footer">FIME 404 · Gestión de objetos resguardados</footer>
  </div>;
}
