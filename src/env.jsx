// Multi-negocio: el subdominio identifica el negocio (pizzeria.chatcenter.com → "pizzeria")
// y se envía al API en la cabecera X-Negocio. En desarrollo sirve pizzeria.localhost:5173;
// en localhost a secas (o dominios de 2 niveles) se usa VITE__NEGOCIO.
const SUBDOMINIOS_RESERVADOS = ['www', 'api', 'app', 'admin'];

const resolverNegocio = () => {
  const partes = window.location.hostname.split('.');
  const esLocalhost = partes[partes.length - 1] === 'localhost';
  const tieneSubdominio = esLocalhost ? partes.length >= 2 : partes.length >= 3;
  const sub = partes[0];
  if (tieneSubdominio && !SUBDOMINIOS_RESERVADOS.includes(sub) && Number.isNaN(Number(sub))) {
    return sub.toLowerCase();
  }
  return import.meta.env.VITE__NEGOCIO || '';
};

const environment = {
  API_URL: import.meta.env.VITE__API_URL || 'http://chatcenter.test',
  NEGOCIO: resolverNegocio(),
};

export default environment;
