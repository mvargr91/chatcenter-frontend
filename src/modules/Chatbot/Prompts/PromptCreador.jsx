import React from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import { Alert } from '@mui/material';
import AppCrudDialog from '../../../shared/components/AppCrudDialog';
import AppCrudForm from '../../../shared/components/AppCrudForm';
import MyTextField from '../../../shared/components/MyTextField';
import MyRadioField from '../../../shared/components/MyRadioField';
import { onShow, onCreate, onUpdate, resetActual } from '../../../@crema/redux/features/prompts/promptsSlice';
import { aRadio, OPCIONES_ESTADO } from '../../../shared/constants/Comunes';

const validationSchema = yup.object({
  titulo: yup.string().required('Requerido').max(150),
  contenido: yup.string().required('Escribe las instrucciones').max(60000),
});

// Se edita como texto plano; el backend también acepta HTML (plantillas) y lo convierte a texto.
const aTexto = (html) =>
  String(html ?? '')
    .replace(/<\s*(br|\/p|\/h[1-6]|\/li)\s*\/?>/gi, '\n')
    .replace(/<\s*h[1-6][^>]*>/gi, '\n## ')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const initialValues = (registro) => ({
  id: registro?.id ?? '',
  titulo: registro?.titulo ?? '',
  contenido: aTexto(registro?.contenido),
  estado: aRadio(registro?.estado),
});

const PromptCreador = ({ prompt, accion, handleOnClose, updateColeccion, titulo }) => (
  <AppCrudDialog
    stateKey='prompts'
    registroId={prompt}
    accion={accion}
    handleOnClose={handleOnClose}
    updateColeccion={updateColeccion}
    onShow={onShow}
    onCreate={onCreate}
    onUpdate={onUpdate}
    resetActual={resetActual}
    initialValues={initialValues}
    validationSchema={validationSchema}
    maxWidth='md'
  >
    {({ saving }) => {
      const disabled = accion === 'ver';
      return (
        <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
          <MyTextField autoFocus className='campo-completo' fullWidth label='Título' name='titulo' disabled={disabled} required />
          {!disabled && (
            <Alert severity='info' className='campo-completo'>
              Cuéntale como a un empleado nuevo: quién es, qué vende, horario, formas de pago y qué no debe prometer.
              No hace falta escribir los precios: el asistente recibe tu catálogo actualizado.
            </Alert>
          )}
          <MyTextField className='campo-completo' fullWidth multiline minRows={14} label='Instrucciones' name='contenido' disabled={disabled} required />
          <MyRadioField label='Usar estas instrucciones' name='estado' disabled={disabled} required options={OPCIONES_ESTADO} />
        </AppCrudForm>
      );
    }}
  </AppCrudDialog>
);

PromptCreador.propTypes = {
  prompt: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
};

export default PromptCreador;
