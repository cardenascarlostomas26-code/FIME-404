# FIME 404

Plataforma web minimalista y responsiva para la gestión, reporte y entrega física centralizada de objetos perdidos en **Prefectura** dentro de la **Facultad de Ingeniería Mecánica y Eléctrica (FIME - UANL)**

## Características Principales

* **Catálogo y Búsqueda en Tiempo Real:** Explora objetos reportados con filtros por categoría fija (`Credenciales/IDs`, `Electrónica/Calculadoras`, `Mochilas/Papelería`, `Ropa/Accesorios`, `Termos`, `Otros`), búsqueda instantánea e historial público de objetos entregados.
* **Reporte de Hallazgos y Compresión en Cliente:** Formulario con compresión automática en navegador mediante `<canvas>` (ancho máximo de `1200px` y compresión JPEG `0.80`–`0.85`) para mantener la nitidez, reducir el peso a **5 MB o menos** y cuidar el espacio en `localStorage`.
* **Acceso por Matrícula y Ticket Digital:** Acceso libre para consultar el catálogo, con registro rápido mediante matrícula universitaria para reportar hallazgos o generar un ticket de reclamo con temporizador (TTL).
* **Comprobante Descargable en JPG:** Permite guardar una ficha/comprobante con código `FIME-XXXX` y QR en la galería para mostrarlo sin conexión en el campus.
* **Panel de Prefectura:**
  * **Recepción y Moderación:** Auto-limpieza de reportes pendientes tras un **TTL de 3 horas** sin validar y doble validación de recepción mediante **código QR** (`html5-qrcode` / `qrcode.react`) o código alfanumérico `FIME-XXXX`.
  * **Inventario en Resguardo:** Vista de control del stock físico en ventanilla.
  * **Bitácora Digital:** Registro histórico de entregas realizadas.
* **Apoyo al Estudiante:** Guía interactiva de categorización y acceso directo al mapa oficial de FIME[cite: 2, 3].

## 🛠️ Stack Tecnológico

* **Frontend:** React 18, Vite, TypeScript
* **Estilos e Íconos:** Tailwind CSS, Lucide React
* **QR y Validación:** `qrcode.react`, `html5-qrcode`
* **Persistencia Local (Pruebas):** `localStorage` con servicio simulado (`src/services/localDb.ts`) y datos semilla de FIME
* **Evolución Planeada:** Backend con FastAPI y base de datos/almacenamiento con Supabase[cite: 1, 2, 3]

## 📁 Estructura del Proyecto

```text
src/
├── types/              # Modelos e interfaces TypeScript
├── services/           # Servicio localDb.ts (localStorage y datos semilla)
├── components/ui/      # Componentes reutilizables (botones, badges, modales)
├── layouts/            # MainLayout (Navbar, buscador y navegación)
├── features/
│   ├── feed/           # Catálogo/feed, tarjetas, filtros, detalle y comentarios
│   ├── report/         # Formulario de hallazgo y compresión de imagen
│   ├── claim/          # Acceso por matrícula y ticket digital
│   └── prefectura/     # Moderación (TTL 3h, QR/código), resguardo y bitácora
└── App.tsx             # Enrutamiento principal
```[cite: 2]


