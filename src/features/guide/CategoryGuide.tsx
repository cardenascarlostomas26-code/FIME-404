import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { CATEGORIES } from '../../types';
const examples: Record<(typeof CATEGORIES)[number], string[]> = {
  'Credenciales/IDs': ['Credencial UANL','INE','Licencia de conducir','Tarjeta Feria / Urbani','Tarjeta bancaria (débito/crédito)','Llaves de casa o auto','Llavero con tag de acceso','Gafete de laboratorio'],
  'Electrónica/Calculadoras': ['Calculadora científica Casio / TI','Audífonos inalámbricos AirPods / FreeBuds','Cargador de laptop','Cable USB-C / Lightning','Memoria USB','Mouse inalámbrico','Powerbank','SmartWatch','Tablet / iPad','Multímetro','Protoboard / componentes'],
  'Mochilas/Papelería': ['Mochila','Lonchera térmica','Lapicera / estuche','Libreta profesional','Carpeta con planos u hojas','Juego de geometría / escalímetro','Bata de laboratorio','Libro de texto','Plumas / marcadores'],
  'Ropa/Accesorios': ['Sudadera / hoodie','Chamarra','Gorra','Lentes graduados o de sol','Paraguas','Reloj analógico','Pulsera / anillo','Bufanda'],
  'Termos': ['Termo metálico Yeti / Stanley','Cilindro de plástico','Botella deportiva','Taza térmica'],
  'Otros': ['Balón deportivo','Casco de moto o bici','Candado de casillero','Dinero en efectivo suelto','Medicamentos / inhalador','Instrumentos musicales'],
};
export function CategoryGuide({ onClose }: { onClose: () => void }) { const [query,setQuery]=useState(''); const filtered=useMemo(()=>CATEGORIES.flatMap(category=>examples[category].filter(item=>item.toLocaleLowerCase().includes(query.toLocaleLowerCase())).map(item=>({category,item}))),[query]); return <Modal title="Guía de categorías" onClose={onClose} wide><p className="muted guide-intro">Busca el objeto para elegir la categoría que mejor lo describe.</p><div className="guide-search"><Search size={16}/><input spellCheck lang="es" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Busca un objeto…"/></div><div className="guide-table-wrap"><table className="guide-table"><thead><tr><th>Objeto</th><th>Categoría</th></tr></thead><tbody>{filtered.map(row=><tr key={`${row.category}-${row.item}`}><td>{row.item}</td><td><span className="badge category-badge">{row.category}</span></td></tr>)}</tbody></table>{!filtered.length&&<div className="empty-admin">No encontramos ese objeto en la guía.</div>}</div></Modal>; }
