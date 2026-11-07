import React from 'react';
import { authRole } from '@crema/constants/AppConst';
import { RoutePermittedRole } from '@crema/constants/AppEnums';
import { rutasCrud } from '../../../shared/components/PaginaCrud';

// Atención
const Chat = React.lazy(() => import('../../../modules/Atencion/Chat'));
const Contactos = React.lazy(() => import('../../../modules/Atencion/Contactos'));
const ContactoCreador = React.lazy(() => import('../../../modules/Atencion/Contactos/ContactoCreador'));
const Ordenes = React.lazy(() => import('../../../modules/Atencion/Ordenes'));
const OrdenCreador = React.lazy(() => import('../../../modules/Atencion/Ordenes/OrdenCreador'));
// Chatbot
const Bots = React.lazy(() => import('../../../modules/Chatbot/Bots'));
const BotCreador = React.lazy(() => import('../../../modules/Chatbot/Bots/BotCreador'));
const Plantillas = React.lazy(() => import('../../../modules/Chatbot/Plantillas'));
const Prompts = React.lazy(() => import('../../../modules/Chatbot/Prompts'));
const PromptCreador = React.lazy(() => import('../../../modules/Chatbot/Prompts/PromptCreador'));
// Catálogo
const Categorias = React.lazy(() => import('../../../modules/Catalogo/Categorias'));
const CategoriaCreador = React.lazy(() => import('../../../modules/Catalogo/Categorias/CategoriaCreador'));
const Productos = React.lazy(() => import('../../../modules/Catalogo/Productos'));
const ProductoCreador = React.lazy(() => import('../../../modules/Catalogo/Productos/ProductoCreador'));
// Configuración
const NumerosWhatsapp = React.lazy(() => import('../../../modules/Configuracion/NumerosWhatsapp'));
const NumeroCreador = React.lazy(() => import('../../../modules/Configuracion/NumerosWhatsapp/NumeroCreador'));

// Al guardar se vuelve a la lista, que se recarga al montarse.
const sinRecarga = () => {};

// Props comunes de los formularios mostrados como vista (ver PaginaCrud).
const props = ({ accion, volver, titulo }) => ({
  accion,
  titulo,
  handleOnClose: volver,
  updateColeccion: sinRecarga,
});

const pagina = (path, Componente) => ({
  permittedRole: RoutePermittedRole.User,
  path,
  element: <Componente route={{ auth: authRole, path }} />,
});

export const chatCenterConfigs = [
  // Atención
  pagina('/chat', Chat),
  ...rutasCrud('/contactos', Contactos, (p) => <ContactoCreador contacto={p.id} {...props(p)} />, ['editar', 'ver']),
  ...rutasCrud('/ordenes', Ordenes, (p) => <OrdenCreador orden={p.id} {...props(p)} />, ['editar', 'ver']),
  // Chatbot
  ...rutasCrud('/bots', Bots, (p) => <BotCreador bot={p.id} {...props(p)} />),
  pagina('/plantillas-negocio', Plantillas),
  ...rutasCrud('/prompts', Prompts, (p) => <PromptCreador prompt={p.id} {...props(p)} />),
  // Catálogo
  ...rutasCrud('/categorias', Categorias, (p) => <CategoriaCreador categoria={p.id} {...props(p)} />),
  ...rutasCrud('/productos', Productos, (p) => <ProductoCreador producto={p.id} {...props(p)} />),
  // Configuración
  ...rutasCrud('/numeros-whatsapp', NumerosWhatsapp, (p) => <NumeroCreador numero={p.id} {...props(p)} />),
];
