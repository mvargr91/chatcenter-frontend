# ChatCenter — Frontend

Panel de ChatCenter para los negocios: chat con clientes de WhatsApp, flujo del bot, plantillas por rubro,
catálogo, órdenes y números de WhatsApp. React 18 + Vite + MUI + Redux Toolkit sobre la plantilla Crema,
con la misma estructura de ERP Academia.

## Módulos

| Menú | Ruta | Carpeta |
|---|---|---|
| Atención → Chat | `/chat` | `src/modules/Atencion/Chat` |
| Atención → Contactos / Órdenes | `/contactos`, `/ordenes` | `src/modules/Atencion` |
| Chatbot → Flujo del bot (mapa + editor con vista previa de WhatsApp) | `/bots` | `src/modules/Chatbot/Bots` |
| Chatbot → Plantillas de negocio | `/plantillas-negocio` | `src/modules/Chatbot/Plantillas` |
| Chatbot → Asistente IA | `/prompts` | `src/modules/Chatbot/Prompts` |
| Catálogo → Categorías / Productos y servicios | `/categorias`, `/productos` | `src/modules/Catalogo` |
| Configuración → Números de WhatsApp | `/numeros-whatsapp` | `src/modules/Configuracion/NumerosWhatsapp` |

El menú lo arma el backend según los permisos del rol (seeder `MenuChatCenterSeeder`).
Las rutas están en `src/@crema/core/AppRoutes/ChatCenter.jsx`.

## Desarrollo

```bash
npm ci
cp .env.example .env     # VITE__API_URL y VITE__NEGOCIO
npm run dev              # http://127.0.0.1:5173
```

El negocio se toma del subdominio (`samfer.localhost:5173` → `samfer`) o de `VITE__NEGOCIO`, y viaja al API
en la cabecera `X-Negocio`.

## Marca

`public/brand` tiene el logo de ChatCenter en SVG y los PNG generados a partir de él; los colores por defecto
están en `src/shared/constants/Marca.jsx` y `src/shared/apariencia/tema.js`.
