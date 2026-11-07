// ChatCenter: números de WhatsApp del negocio
import { createCrudSlice } from '../../helpers/createCrudSlice';

const { slice, thunks } = createCrudSlice({
  name: 'numerosWhatsapp',
  endpoint: 'numeros-whatsapp',
});

export const {
  onGetColeccion,
  onGetColeccionLigera,
  onShow,
  onCreate,
  onUpdate,
  onDelete,
} = thunks;

export const { resetError, resetActual, resetColeccion } = slice.actions;
export default slice.reducer;
