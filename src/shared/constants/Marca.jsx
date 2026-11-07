// Identidad visual por defecto de la plataforma, ChatCenter (cada negocio la sobrescribe en Apariencia).
// Las imágenes viven en /public/brand (SVG originales y PNG generados a partir de ellos).

export const MARCA = {
  nombre: 'ChatCenter',
  eslogan: 'Tu negocio atiende por WhatsApp, solo.',
  logos: {
    // Fondos claros: portal público, correos, documentos.
    principal: '/brand/logo.png',
    // Fondos oscuros: el nombre pasa a blanco.
    oscuro: '/brand/logo-oscuro.png',
    // Espacios cuadrados o pequeños: la burbuja (menú colapsado, avatar, loader, redes).
    isotipo: '/brand/isotipo.png',
  },
};

// Colores de la marca ChatCenter. Los nombres de las claves se conservan porque el tema del panel
// (defaultConfig) los usa así: azul = color principal, azulOscuro = menú, violeta = acento.
export const COLORES_MARCA = {
  azul: '#128C7E', // burbuja
  azulOscuro: '#0B2027', // nombre «Chat» y menú
  violeta: '#25D366', // punto verde
  cian: '#5EE6A8',
  texto: '#0B2027',
};

// Interruptor del tema del panel: con VITE__TEMA_MARCA=false en .env el panel vuelve a los colores anteriores.
export const TEMA_MARCA_PANEL = import.meta.env.VITE__TEMA_MARCA !== 'false';
