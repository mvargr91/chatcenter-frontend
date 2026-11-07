import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import usuariosReducer from './features/usuarios/usuariosSlice';
import commonReducer from './features/cammon/commonSlice';
import rolesReducer from './features/rol/rolesSlice';
import modulosReducer from './features/modulo/moduloSlice';
import opcionSistemaReducer from './features/opcionSistema/opcionSistemaSlice';
import permisosReducer from './features/permiso/permisoSlice';
import aplicacionesReducer from './features/aplicacion/aplicacionSlice';
import auditoriasReducer from './features/auditorias/auditoriasSlice';

// Mi cuenta
import cuentaReducer from './features/cuenta/cuentaSlice';
// ChatCenter
import botsReducer from './features/bots/botsSlice';
import categoriasReducer from './features/categorias/categoriasSlice';
import productosReducer from './features/productos/productosSlice';
import promptsReducer from './features/prompts/promptsSlice';
import contactosReducer from './features/contactos/contactosSlice';
import ordenesReducer from './features/ordenes/ordenesSlice';
import numerosWhatsappReducer from './features/numerosWhatsapp/numerosWhatsappSlice';
import parametrosReducer from './features/parametros/parametrosSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    usuarios: usuariosReducer,
    common: commonReducer,
    roles: rolesReducer,
    modulos: modulosReducer,
    opcionSistema: opcionSistemaReducer,
    permisos: permisosReducer,
    aplicaciones: aplicacionesReducer,
    auditorias: auditoriasReducer,
    // Mi cuenta
    cuenta: cuentaReducer,
    // ChatCenter
    bots: botsReducer,
    categorias: categoriasReducer,
    productos: productosReducer,
    prompts: promptsReducer,
    contactos: contactosReducer,
    ordenes: ordenesReducer,
    numerosWhatsapp: numerosWhatsappReducer,
    parametros: parametrosReducer,
  },
});

export default store;
