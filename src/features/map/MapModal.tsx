import { ExternalLink, MapPin } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

const MAP_URL = 'https://www.fime.uanl.mx/mapa-de-la-fime/';

export function MapModal({ onClose }: { onClose: () => void }) {
  return <Modal title="Mapa de FIME" onClose={onClose}>
    <div className="map-link-card">
      <span className="map-link-icon"><MapPin size={22}/></span>
      <p>El mapa oficial se consulta directamente en el sitio de FIME.</p>
      <a className="button button-primary button-full" href={MAP_URL} target="_blank" rel="noreferrer">
        Abrir mapa de FIME <ExternalLink size={15}/>
      </a>
    </div>
  </Modal>;
}
