import React from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import AppCrudDialog from '../../../shared/components/AppCrudDialog';
import AppCrudForm from '../../../shared/components/AppCrudForm';
import MyTextField from '../../../shared/components/MyTextField';
import MyRadioField from '../../../shared/components/MyRadioField';
import { onShow, onCreate, onUpdate, resetActual } from '../../../@crema/redux/features/categorias/categoriasSlice';
import { aRadio, OPCIONES_ESTADO, LIMITES } from '../../../shared/constants/Comunes';

const validationSchema = yup.object({
  nombre: yup.string().required('Requerido').max(LIMITES.fila_titulo, `WhatsApp muestra máximo ${LIMITES.fila_titulo} caracteres`),
  orden: yup.number().typeError('Debe ser un número').min(0).max(999),
});

const initialValues = (registro) => ({
  id: registro?.id ?? '',
  nombre: registro?.nombre ?? '',
  orden: registro?.orden ?? 0,
  estado: aRadio(registro?.estado),
});

const CategoriaCreador = ({ categoria, accion, handleOnClose, updateColeccion, titulo }) => (
  <AppCrudDialog
    stateKey='categorias'
    registroId={categoria}
    accion={accion}
    handleOnClose={handleOnClose}
    updateColeccion={updateColeccion}
    onShow={onShow}
    onCreate={onCreate}
    onUpdate={onUpdate}
    resetActual={resetActual}
    initialValues={initialValues}
    validationSchema={validationSchema}
    maxWidth='sm'
  >
    {({ saving }) => {
      const disabled = accion === 'ver';
      return (
        <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
          <MyTextField autoFocus className='campo-completo' fullWidth label='Nombre' name='nombre' disabled={disabled} required
            helperText='Ej: Entradas, Platos fuertes, Bebidas' />
          <MyTextField fullWidth type='number' label='Orden en la lista' name='orden' disabled={disabled} />
          <MyRadioField label='Estado' name='estado' disabled={disabled} required options={OPCIONES_ESTADO} />
        </AppCrudForm>
      );
    }}
  </AppCrudDialog>
);

CategoriaCreador.propTypes = {
  categoria: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
};

export default CategoriaCreador;
