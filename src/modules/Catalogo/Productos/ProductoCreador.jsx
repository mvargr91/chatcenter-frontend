import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import AppCrudDialog from '../../../shared/components/AppCrudDialog';
import AppCrudForm from '../../../shared/components/AppCrudForm';
import MyTextField from '../../../shared/components/MyTextField';
import MySelectField from '../../../shared/components/MySelectField';
import MyRadioField from '../../../shared/components/MyRadioField';
import { onShow, onCreate, onUpdate, resetActual } from '../../../@crema/redux/features/productos/productosSlice';
import { onGetColeccionLigera as onGetCategorias } from '../../../@crema/redux/features/categorias/categoriasSlice';
import { aRadio, OPCIONES_ESTADO, TIPOS_PRODUCTO, LIMITES } from '../../../shared/constants/Comunes';

const validationSchema = yup.object({
  categoria_id: yup.string().required('Elige una categoría'),
  tipo: yup.string().required('Requerido'),
  nombre: yup.string().required('Requerido').max(LIMITES.fila_titulo, `WhatsApp muestra máximo ${LIMITES.fila_titulo} caracteres`),
  descripcion: yup.string().nullable().max(255, 'Máximo 255 caracteres'),
  precio: yup.number().typeError('Debe ser un número').required('Requerido').min(0, 'No puede ser negativo'),
  duracion_minutos: yup.number().typeError('Debe ser un número').nullable().min(1).max(1440),
});

const initialValues = (registro) => ({
  id: registro?.id ?? '',
  categoria_id: registro?.categoria_id ?? '',
  tipo: registro?.tipo ?? 'producto',
  nombre: registro?.nombre ?? '',
  descripcion: registro?.descripcion ?? '',
  precio: registro?.precio ?? '',
  duracion_minutos: registro?.duracion_minutos ?? '',
  orden: registro?.orden ?? 0,
  estado: aRadio(registro?.estado),
});

const transformar = (datos) => ({ ...datos, duracion_minutos: datos.duracion_minutos === '' ? null : datos.duracion_minutos });

const ProductoCreador = ({ producto, accion, handleOnClose, updateColeccion, titulo }) => {
  const dispatch = useDispatch();
  const categorias = useSelector((state) => state.categorias.coleccionLigera) ?? [];

  useEffect(() => {
    dispatch(onGetCategorias());
  }, [dispatch]);

  return (
    <AppCrudDialog
      stateKey='productos'
      registroId={producto}
      accion={accion}
      handleOnClose={handleOnClose}
      updateColeccion={updateColeccion}
      onShow={onShow}
      onCreate={onCreate}
      onUpdate={onUpdate}
      resetActual={resetActual}
      initialValues={initialValues}
      validationSchema={validationSchema}
      transformarAntesDeEnviar={transformar}
      maxWidth='sm'
    >
      {({ values, saving }) => {
        const disabled = accion === 'ver';
        return (
          <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
            <MyTextField autoFocus className='campo-completo' fullWidth label='Nombre' name='nombre' disabled={disabled} required
              helperText={`Así aparece en el chat (máx. ${LIMITES.fila_titulo} caracteres).`} />
            <MySelectField fullWidth label='Categoría' name='categoria_id' disabled={disabled} required
              options={categorias.map((c) => ({ id: c.id, nombre: c.nombre }))} variant='standard' />
            <MySelectField fullWidth label='Tipo' name='tipo' disabled={disabled} required options={TIPOS_PRODUCTO} variant='standard' />
            <MyTextField fullWidth type='number' label='Precio' name='precio' disabled={disabled} required />
            {values.tipo === 'servicio' && (
              <MyTextField fullWidth type='number' label='Duración (minutos)' name='duracion_minutos' disabled={disabled} />
            )}
            <MyTextField className='campo-completo' fullWidth multiline label='Descripción (para el asistente IA)' name='descripcion' disabled={disabled} />
            <MyTextField fullWidth type='number' label='Orden en la lista' name='orden' disabled={disabled} />
            <MyRadioField label='Estado' name='estado' disabled={disabled} required options={OPCIONES_ESTADO} />
          </AppCrudForm>
        );
      }}
    </AppCrudDialog>
  );
};

ProductoCreador.propTypes = {
  producto: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
};

export default ProductoCreador;
