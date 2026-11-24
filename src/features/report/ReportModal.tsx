import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Camera, ImagePlus, MapPin, Trash2, Upload } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { CATEGORIES, type Category, type Item, type UserSession } from '../../types';
import { textAutoCorrect } from '../../utils/textAutoCorrect';
import { ReceiptModal } from './ReceiptModal';
import { checkReportRateLimit, recordReportSubmission } from '../../services/antiAbuseGuard';

function compress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) { URL.revokeObjectURL(url); reject(new Error('No se pudo procesar la imagen')); return; }
      let width=Math.min(image.naturalWidth,1100);
      let height=Math.round(image.naturalHeight*(width/image.naturalWidth));
      let quality=0.85;
      let data='';
      while(true) {
        canvas.width=width;canvas.height=height;
        context.drawImage(image,0,0,width,height);
        data=canvas.toDataURL('image/jpeg',quality);
        if(data.length<=1.1*1024*1024)break;
        if(width>500){width=Math.max(500,Math.floor(width*0.82));height=Math.round(image.naturalHeight*(width/image.naturalWidth));}
        else if(quality>0.65)quality=Math.max(0.65,quality-0.05);
        else break;
      }
      URL.revokeObjectURL(url);
      if(data.length>1.5*1024*1024)reject(new Error('La imagen no se pudo reducir lo suficiente para guardarla localmente'));
      else resolve(data);
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen')); };
    image.src = url;
  });
}

export function ReportModal({ onClose, user, onCreate, onGuide, onMap }: { onClose: () => void; user: UserSession; onCreate: (data: Pick<Item, 'title' | 'description' | 'location' | 'category' | 'image' | 'images'>) => Item; onGuide: () => void; onMap: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Item | null>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;
    const allowed = files.slice(0, Math.max(0, 2 - images.length));
    if (!allowed.length) { setError('Puedes agregar hasta dos fotos.'); return; }
    if (files.length > allowed.length) setError('Se permiten máximo dos fotos; se procesarán las que caben.');
    const invalidType = allowed.find(file => !file.type.startsWith('image/'));
    if (invalidType) { setError('Selecciona archivos de imagen.'); return; }
    const oversized = allowed.find(file => file.size > 12 * 1024 * 1024);
    if (oversized) { setError('Cada imagen debe pesar menos de 12 MB.'); return; }
    setBusy(true);
    try { const compressed = await Promise.all(allowed.map(compress)); setImages(current => [...current, ...compressed].slice(0, 2)); if (files.length <= allowed.length) setError(''); } catch { setError('No se pudieron procesar las imágenes.'); } finally { setBusy(false); }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) { setError('Completa todos los campos.'); return; }
    if (!images.length) { setError('Sube al menos una imagen del objeto.'); return; }
    const limit = checkReportRateLimit();
    if (!limit.allowed) {
      const minutes = Math.max(1, Math.ceil(limit.retryAfterMs / 60_000));
      setError(`Alcanzaste el límite de 3 reportes en 3 horas. Intenta de nuevo en ${minutes} min.`);
      return;
    }
    const item = onCreate({ title: title.trim(), description: description.trim(), location: location.trim(), category, image: images[0], images });
    recordReportSubmission();
    setCreated(item);
  };
  if (created) return <ReceiptModal item={created} onClose={onClose}/>;
  return <Modal title="Reportar un hallazgo" onClose={onClose}><form className="form-stack" onSubmit={submit}>
    <div className="notice"><MapPin size={17}/><span>Hola <b>{user.name.split(' ')[0]}</b>. Los objetos se entregan y resguardan en <b>Prefectura</b>. Cuéntanos dónde lo encontraste.</span></div>
    <button type="button" className="text-button guide-form-link" onClick={onGuide}>¿No sabes cómo catalogar el objeto?</button>
    <label>Nombre del objeto<input autoFocus lang="es" spellCheck value={title} onChange={event => setTitle(textAutoCorrect(event.target.value))} placeholder="Ej. Audífonos blancos" maxLength={70}/></label>
    <label>Categoría<select value={category} onChange={event => setCategory(event.target.value as Category)}>{CATEGORIES.map(value => <option key={value}>{value}</option>)}</select></label>
    <label>¿Dónde lo encontraste?<input lang="es" spellCheck value={location} onChange={event => setLocation(textAutoCorrect(event.target.value))} placeholder="Ej. Biblioteca, planta baja" maxLength={100}/><button type="button" className="button button-outline location-map-button" onClick={onMap}>📍 Ver Mapa de FIME</button></label>
    <label>Descripción<textarea lang="es" spellCheck rows={3} value={description} onChange={event => setDescription(textAutoCorrect(event.target.value))} placeholder="Color, marca, señas particulares…" maxLength={500}/></label>
    <div className="report-photos"><div className="report-photos-heading"><b>Imágenes del objeto <span>1 obligatoria · hasta 2</span></b></div>{images.length > 0 && <div className="report-photo-previews">{images.map((image,index)=><div className="report-photo-preview" key={index}><img src={image} alt={`Foto ${index+1} del objeto`}/><span>Foto {index+1}</span><button type="button" className="remove-photo" onClick={()=>setImages(current=>current.filter((_,i)=>i!==index))} aria-label={`Quitar foto ${index+1}`}><Trash2 size={15}/></button></div>)}</div>}{images.length < 2 && <div className="upload-options"><button type="button" className="upload-box" disabled={busy} onClick={()=>galleryInput.current?.click()}><ImagePlus size={21}/><span>SUBIR IMAGEN</span></button><button type="button" className="upload-box" disabled={busy} onClick={()=>cameraInput.current?.click()}><Camera size={21}/><span>USAR CÁMARA</span></button><input ref={galleryInput} type="file" accept="image/*" multiple onChange={handleFile} hidden/><input ref={cameraInput} type="file" accept="image/*" capture="environment" onChange={handleFile} hidden/></div>}</div>
    {error && <p className="error-text">{error}</p>}<p className="muted tiny">Tu reporte quedará pendiente hasta que Prefectura confirme la recepción física.</p>
    <button className="button button-primary button-full" disabled={busy}><Upload size={16}/> Enviar reporte</button>
  </form></Modal>;
}
