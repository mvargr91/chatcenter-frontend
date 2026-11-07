// ChatCenter: pasos del flujo del chatbot
import { createCrudSlice } from '../../helpers/createCrudSlice';

const { slice, thunks } = createCrudSlice({
  name: 'bots',
  endpoint: 'bots',
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
