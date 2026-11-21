import { useState, type ChangeEvent, type FormEvent } from 'react';
import { ImagePlus, MapPin, Upload } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { CATEGORIES, type Category, type Item, type UserSession } from '../../types';
import { textAutoCorrect } from '../../utils/textAutoCorrect';
import { ReceiptModal } from './ReceiptModal';

function compress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) { URL.revokeObjectURL(url); reject(new Error('No se pudo procesar la imagen')); return; }
      let width=Math.min(image.naturalWidth,1200);
      let height=Math.round(image.naturalHeight*(width/image.naturalWidth));
      let quality=0.85;
      let data='';
      while(true) {
        canvas.width=width;canvas.height=height;
        context.drawImage(image,0,0,width,height);
        data=canvas.toDataURL('image/jpeg',quality);
        if(data.length<=4.5*1024*1024)break;
        if(width>600){width=Math.max(600,Math.floor(width*0.85));height=Math.round(image.naturalHeight*(width/image.naturalWidth));}
        else if(quality>0.65)quality=Math.max(0.65,quality-0.05);
        else break;
      }
      URL.revokeObjectURL(url);
      if(data.length>5*1024*1024)reject(new Error('La imagen supera el límite de almacenamiento local'));
      else resolve(data);
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen')); };
    image.src = url;
  });
}

export function ReportModal({ onClose, user, onCreate, onGuide, onMap }: { onClose: () => void; user: UserSession; onCreate: (data: Pick<Item, 'title' | 'description' | 'location' | 'category' | 'image'>) => Item; onGuide: () => void; onMap: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Item | null>(null);
  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Selecciona un archivo de imagen.'); return; }
    if (file.size > 12 * 1024 * 1024) { setError('La imagen debe pesar menos de 12 MB.'); return; }
    setBusy(true);
    try { setImage(await compress(file)); setError(''); } catch { setError('No se pudo procesar la imagen.'); } finally { setBusy(false); }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) { setError('Completa todos los campos.'); return; }
    setCreated(onCreate({ title: title.trim(), description: description.trim(), location: location.trim(), category, ...(image ? { image } : {}) }));
  };
  if (created) return <ReceiptModal item={created} onClose={onClose}/>;
  return <Modal title="Reportar un hallazgo" onClose={onClose}><form className="form-stack" onSubmit={submit}>
    <div className="notice"><MapPin size={17}/><span>Hola <b>{user.name.split(' ')[0]}</b>. Los objetos se entregan y resguardan en <b>Prefectura</b>. Cuéntanos dónde lo encontraste.</span></div>
    <button type="button" className="text-button guide-form-link" onClick={onGuide}>¿No sabes cómo catalogar el objeto?</button>
    <label>Nombre del objeto<input autoFocus lang="es" spellCheck value={title} onChange={event => setTitle(textAutoCorrect(event.target.value))} placeholder="Ej. Audífonos blancos" maxLength={70}/></label>
    <label>Categoría<select value={category} onChange={event => setCategory(event.target.value as Category)}>{CATEGORIES.map(value => <option key={value}>{value}</option>)}</select></label>
    <label>¿Dónde lo encontraste?<input lang="es" spellCheck value={location} onChange={event => setLocation(textAutoCorrect(event.target.value))} placeholder="Ej. Biblioteca, planta baja" maxLength={100}/><button type="button" className="button button-outline location-map-button" onClick={onMap}>📍 Ver Mapa de FIME</button></label>
    <label>Descripción<textarea lang="es" spellCheck rows={3} value={description} onChange={event => setDescription(textAutoCorrect(event.target.value))} placeholder="Color, marca, señas particulares…" maxLength={500}/></label>
    <label className="upload-box">{image ? <img className="upload-preview" src={image} alt="Vista previa"/> : <><ImagePlus size={22}/><span>{busy ? 'Procesando imagen…' : 'Agregar una foto (opcional)'}</span><small>En móvil puedes abrir la cámara · Se optimiza automáticamente</small></>}<input type="file" accept="image/*" capture="environment" onChange={handleFile} hidden/></label>
    {error && <p className="error-text">{error}</p>}<p className="muted tiny">Tu reporte quedará pendiente hasta que Prefectura confirme la recepción física.</p>
    <button className="button button-primary button-full" disabled={busy}><Upload size={16}/> Enviar reporte</button>
  </form></Modal>;
}
