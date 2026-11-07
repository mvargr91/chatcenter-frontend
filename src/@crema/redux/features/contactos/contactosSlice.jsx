// ChatCenter: contactos que escribieron por WhatsApp
import { createCrudSlice } from '../../helpers/createCrudSlice';

const { slice, thunks } = createCrudSlice({
  name: 'contactos',
  endpoint: 'contactos',
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
