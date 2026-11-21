import { useEffect, useRef, useState } from 'react';
import { toJpeg } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowDownToLine, Clock3 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import type { Item } from '../../types';
import bearLogo from '../../assets/fime-404-bear.png';

function remaining(expiresAt?: string, now = Date.now()) { if (!expiresAt) return '—'; const ms=Math.max(0,new Date(expiresAt).getTime()-now); return [Math.floor(ms/3600000),Math.floor(ms%3600000/60000),Math.floor(ms%60000/1000)].map(value=>String(value).padStart(2,'0')).join(':'); }
export function ReceiptModal({ item, onClose, compact = false }: { item: Item; onClose: () => void; compact?: boolean }) {
  const ref=useRef<HTMLDivElement>(null); const [now,setNow]=useState(Date.now()); const [error,setError]=useState('');
  useEffect(()=>{const id=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(id);},[]);
  const download=async()=>{if(!ref.current)return;setError('');try{const data=await toJpeg(ref.current,{quality:.96,pixelRatio:3,backgroundColor:'#ffffff'});const link=document.createElement('a');link.download=`FIME-404-${item.receiveCode??item.id}.jpg`;link.href=data;link.click();}catch{setError('No se pudo generar la imagen. Revisa que la foto esté cargada e inténtalo de nuevo.');}};
  return <Modal title={compact?'Comprobante de recepción':'Tu hallazgo fue enviado'} onClose={onClose}><div className="receipt-wrap"><p className="muted">Guarda esta ficha y presenta el código al entregar el objeto en Prefectura.</p><div className="receipt-card" ref={ref}><div className="receipt-brand"><img src={bearLogo} alt="Logotipo del oso FIME"/><div><b>FIME 404</b><small>OBJETOS PERDIDOS · UANL</small></div><span className="receipt-tag">RECEPCIÓN</span></div>{item.image&&<img className="receipt-photo" src={item.image} alt={item.title}/>}<h3>{item.title}</h3><span className="badge category-badge">{item.category}</span><div className="receipt-details"><p><small>ENCONTRADO EN</small><b>{item.location}</b></p><p><small>REPORTÓ</small><b>{item.reporterName} · {item.reporterId}</b></p><p><small>ENTREGAR ANTES DE</small><b>{item.expiresAt?new Date(item.expiresAt).toLocaleString('es-MX',{dateStyle:'short',timeStyle:'short'}):'—'}</b></p></div><div className="receipt-code"><div><small>CÓDIGO DE RECEPCIÓN</small><b>{item.receiveCode}</b><span><Clock3 size={13}/>{remaining(item.expiresAt,now)}</span></div>{item.qrToken&&<QRCodeSVG value={item.qrToken} size={104} level="H" includeMargin/>}</div><div className="receipt-foot">La recepción física debe confirmarse en Prefectura dentro de 3 horas.</div></div>{error&&<p className="error-text">{error}</p>}<button className="button button-primary button-full" onClick={download}><ArrowDownToLine size={16}/> Descargar comprobante (.JPG)</button></div></Modal>;
}
