// ChatCenter: categorías del catálogo
import { createCrudSlice } from '../../helpers/createCrudSlice';

const { slice, thunks } = createCrudSlice({
  name: 'categorias',
  endpoint: 'categorias',
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
