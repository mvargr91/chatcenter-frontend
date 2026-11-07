// Catálogos y helpers de ChatCenter.
// Deben coincidir con las reglas `in:` de los controladores del backend.

// Para MyRadioField (usa { value, label }).
export const OPCIONES_ESTADO = [
  { value: '1', label: 'Activo' },
  { value: '0', label: 'Inactivo' },
];

export const OPCIONES_SI_NO = [
  { value: '1', label: 'Sí' },
  { value: '0', label: 'No' },
];

// ----------------------------------------------------------------- Chatbot

export const TIPOS_BOT = [
  { id: 'texto', nombre: 'Solo texto', ayuda: 'Un mensaje sin opciones.' },
  { id: 'botones', nombre: 'Con botones', ayuda: 'Hasta 3 botones que el cliente toca.' },
  { id: 'lista', nombre: 'Con lista de opciones', ayuda: 'Un botón que abre hasta 10 opciones.' },
];

export const ACCIONES_BOT = [
  { id: 'ninguna', nombre: 'Solo enviar el mensaje', ayuda: '' },
  { id: 'inicio', nombre: 'Empezar un pedido nuevo', ayuda: 'Borra lo que el cliente había elegido antes. Úsalo en el saludo.' },
  { id: 'categorias', nombre: 'Mostrar las categorías del catálogo', ayuda: 'Lista tus categorías; las opciones que agregues aparecen al final.' },
  { id: 'catalogo', nombre: 'Mostrar productos o servicios', ayuda: 'Lista los de la categoría que el cliente eligió.' },
  { id: 'resumen', nombre: 'Mostrar el resumen y guardar la orden', ayuda: 'Junta lo elegido y los datos que escribió el cliente.' },
  { id: 'total', nombre: 'Agregar el total a pagar', ayuda: 'Pone el valor de la orden al final del mensaje.' },
  { id: 'asesor', nombre: 'Pasar con una persona', ayuda: 'El bot deja de responder y la conversación aparece en el Chat.' },
  { id: 'ia', nombre: 'Pasar al asistente IA', ayuda: 'Desde aquí responde la inteligencia artificial.' },
];

export const MODOS_CONVERSACION = [
  { id: 'bot', nombre: 'Bot', color: '#1976d2' },
  { id: 'ia', nombre: 'Asistente IA', color: '#8e24aa' },
  { id: 'asesor', nombre: 'Asesor', color: '#ef6c00' },
];

export const ESTADOS_ORDEN = [
  { id: 'pendiente', nombre: 'Pendiente', color: '#ef6c00' },
  { id: 'confirmada', nombre: 'Confirmada', color: '#1976d2' },
  { id: 'pagada', nombre: 'Pagada', color: '#2e7d32' },
  { id: 'cancelada', nombre: 'Cancelada', color: '#c62828' },
];

export const TIPOS_PRODUCTO = [
  { id: 'producto', nombre: 'Producto' },
  { id: 'servicio', nombre: 'Servicio' },
];

export const MONEDAS = [
  { id: 'COP', nombre: 'Peso colombiano (COP)' },
  { id: 'MXN', nombre: 'Peso mexicano (MXN)' },
  { id: 'USD', nombre: 'Dólar (USD)' },
  { id: 'PEN', nombre: 'Sol peruano (PEN)' },
  { id: 'CLP', nombre: 'Peso chileno (CLP)' },
  { id: 'ARS', nombre: 'Peso argentino (ARS)' },
  { id: 'EUR', nombre: 'Euro (EUR)' },
  { id: 'GTQ', nombre: 'Quetzal (GTQ)' },
  { id: 'DOP', nombre: 'Peso dominicano (DOP)' },
  { id: 'BOB', nombre: 'Boliviano (BOB)' },
];

// Límites de WhatsApp (iguales a ConstructorMensajes::LIMITES del backend).
export const LIMITES = {
  botones: 3,
  boton: 20,
  filas: 10,
  fila_titulo: 24,
  fila_descripcion: 72,
  encabezado: 60,
  pie: 60,
  titulo_lista: 24,
  cuerpo_interactivo: 1024,
  cuerpo_texto: 4096,
};

// ----------------------------------------------------------------- Helpers

export const nombreDe = (lista, id) =>
  lista.find((item) => String(item.id) === String(id))?.nombre ?? id ?? '';

export const colorDe = (lista, id) =>
  lista.find((item) => String(item.id) === String(id))?.color ?? '';

export const esActivo = (valor) => valor === 1 || valor === true || valor === '1';

export const valorActivo = (valor) => (esActivo(valor) ? 'Activo' : 'Inactivo');
export const colorActivo = (valor) => (esActivo(valor) ? 'green' : 'red');
export const valorSiNo = (valor) => (esActivo(valor) ? 'Sí' : 'No');

// Inicializa radios de Formik ('1' | '0') a partir del valor del backend.
export const aRadio = (valor, porDefecto = '1') =>
  valor === undefined || valor === null ? porDefecto : esActivo(valor) ? '1' : '0';

export const formatoMoneda = (valor, moneda = 'COP') =>
  valor === null || valor === undefined || valor === ''
    ? ''
    : new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: moneda,
        maximumFractionDigits: Number(valor) % 1 === 0 ? 0 : 2,
      }).format(Number(valor));

// 2026-11-07 14:30:00 → «hoy 2:30 p. m.», «ayer», «07/11/2026»
export const fechaCorta = (valor) => {
  if (!valor) return '';
  const fecha = new Date(String(valor).replace(' ', 'T'));
  if (Number.isNaN(fecha.getTime())) return valor;
  const hoy = new Date();
  const mismoDia = (a, b) => a.toDateString() === b.toDateString();
  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);
  if (mismoDia(fecha, hoy)) return fecha.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
  if (mismoDia(fecha, ayer)) return 'ayer';
  return fecha.toLocaleDateString('es-CO');
};
