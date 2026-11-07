import React from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import AppCrudDialog from '../../../shared/components/AppCrudDialog';
import AppCrudForm from '../../../shared/components/AppCrudForm';
import MyTextField from '../../../shared/components/MyTextField';
import { onShow, onCreate, onUpdate, resetActual } from '../../../@crema/redux/features/contactos/contactosSlice';

const validationSchema = yup.object({ nombre: yup.string().required('Requerido').max(150) });

const initialValues = (registro) => ({
  id: registro?.id ?? '',
  nombre: registro?.nombre ?? '',
  telefono: registro?.telefono ? `+${registro.telefono}` : '',
});

const ContactoCreador = ({ contacto, accion, handleOnClose, updateColeccion, titulo }) => (
  <AppCrudDialog
    stateKey='contactos'
    registroId={contacto}
    accion={accion}
    handleOnClose={handleOnClose}
    updateColeccion={updateColeccion}
    onShow={onShow}
    onCreate={onCreate}
    onUpdate={onUpdate}
    resetActual={resetActual}
    initialValues={initialValues}
    validationSchema={validationSchema}
    transformarAntesDeEnviar={({ id, nombre }) => ({ id, nombre })}
    maxWidth='sm'
  >
    {({ saving }) => (
      <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
        <MyTextField autoFocus fullWidth label='Nombre' name='nombre' disabled={accion === 'ver'} required />
        <MyTextField fullWidth label='WhatsApp' name='telefono' disabled />
      </AppCrudForm>
    )}
  </AppCrudDialog>
);

ContactoCreador.propTypes = {
  contacto: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
};

export default ContactoCreador;
