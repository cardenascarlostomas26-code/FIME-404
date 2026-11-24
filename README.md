# FIME 404

Plataforma de objetos perdidos y encontrados para la Facultad de Ingeniería Mecánica y Eléctrica (FIME) de la UANL.

## Descripción general

FIME 404 conecta a estudiantes con Prefectura para reportar, localizar y recuperar objetos extraviados dentro de la facultad.

- **Panel de estudiantes (`/`)**: consulta hallazgos, busca por nombre o ubicación, filtra publicaciones, reporta objetos con una o dos imágenes y gestiona reclamos.
- **Panel de Prefectura (`/prefectura-admin`)**: revisa reportes, autoriza la recepción de objetos, valida entregas y consulta la bitácora.
- **Funciones adicionales**: guía alfabética para catalogar objetos, acceso al mapa oficial de FIME y comprobante descargable del reporte.

## Tecnologías y dependencias

- React 18 y React DOM para la interfaz.
- TypeScript para el tipado del código.
- Vite 5 para desarrollo y compilación.
- Tailwind CSS y PostCSS para estilos.
- `lucide-react` para iconos.
- `html5-qrcode` para lectura de códigos QR.
- `qrcode.react` para generar códigos QR.
- `html-to-image` para generar comprobantes descargables.

Las versiones exactas de las dependencias están registradas en `package-lock.json`.

## Requisitos de instalación

- Node.js y npm, en versiones compatibles con Vite 5.
- Git, si se va a clonar el repositorio.
- Conexión a internet durante la instalación de dependencias.

No se requieren variables de entorno para ejecutar la demo actual.

## Instalación y ejecución local

Desde la carpeta raíz del proyecto:

```bash
npm ci
npm run dev
```

Vite mostrará la dirección local en la terminal, normalmente `http://localhost:5173`.

Para crear la versión de producción y revisarla localmente:

```bash
npm run build
npm run preview
```

El comando `build` primero valida y compila TypeScript, y después crea los archivos estáticos dentro de `dist/`.

## Publicación en Netlify

El proyecto incluye `netlify.toml` con el comando de compilación (`npm run build`) y la carpeta de publicación (`dist`). También incluye `public/_redirects` para que las rutas de la aplicación, incluida `/prefectura-admin`, carguen correctamente al abrirse directamente.

Hay dos opciones de publicación:

1. **Subir la carpeta compilada**: ejecuta `npm run build` y arrastra la carpeta `dist/` a Netlify.
2. **Conectar el repositorio**: configura Netlify para usar el comando `npm run build` y publicar `dist/`; la configuración ya está en `netlify.toml`.

## Estructura general del proyecto

```text
.
├── public/                  # Archivos estáticos y reglas de rutas de Netlify
├── src/
│   ├── components/ui/       # Componentes visuales reutilizables
│   ├── features/            # Feed, reportes, reclamos, guía, mapa y Prefectura
│   ├── layouts/             # Estructura visual de cada panel
│   ├── services/            # Almacenamiento local y control anti abuso
│   ├── types/               # Tipos compartidos de TypeScript
│   ├── utils/               # Funciones auxiliares
│   ├── App.tsx              # Rutas y flujo principal de la aplicación
│   └── main.tsx             # Punto de entrada de React
├── index.html               # Página HTML de entrada
├── netlify.toml             # Configuración de compilación de Netlify
├── package.json             # Dependencias y comandos npm
└── tsconfig*.json           # Configuración de TypeScript
```

## Limitaciones y consideraciones técnicas

- La aplicación no tiene un servidor ni una base de datos central. Publicaciones, registros y sesión se guardan en `localStorage` del navegador. Por ello, los datos no se sincronizan entre distintos teléfonos o computadoras y pueden perderse al borrar los datos del navegador.
- El control de tres reportes por cada ventana de tres horas y la vinculación de matrícula con nombre también usan `localStorage`; sirven para pruebas locales, pero no son controles seguros contra manipulación.
- El acceso de Prefectura usa actualmente un PIN de demostración (`1234`) validado en el código del cliente. No debe considerarse autenticación segura para un servicio público real.
- Para compartir datos entre estudiantes y Prefectura en distintos dispositivos, o para proteger el panel administrativo, se necesita un backend con una base de datos compartida y autenticación real.
- La selección de imágenes y el acceso a la cámara dependen de las funciones que ofrezca el navegador y el dispositivo. Los reportes aceptan hasta dos imágenes y las comprimen antes de guardarlas.
- El mapa se abre en el sitio oficial de FIME porque ese sitio no permite mostrarlo dentro de un `iframe`.
