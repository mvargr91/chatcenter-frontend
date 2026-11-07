import React from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import { Box, Divider, Typography } from '@mui/material';
import AppCrudDialog from '../../../shared/components/AppCrudDialog';
import AppCrudForm, { SeccionForm } from '../../../shared/components/AppCrudForm';
import MySelectField from '../../../shared/components/MySelectField';
import { onShow, onCreate, onUpdate, resetActual } from '../../../@crema/redux/features/ordenes/ordenesSlice';
import { ESTADOS_ORDEN, formatoMoneda, fechaCorta } from '../../../shared/constants/Comunes';

const validationSchema = yup.object({ estado: yup.string().required('Requerido') });

const initialValues = (registro) => ({ id: registro?.id ?? '', estado: registro?.estado ?? 'pendiente' });

// Datos capturados en el orden en que el cliente los escribió: [{ etiqueta, valor }]
// (las órdenes antiguas los traen como objeto { etiqueta: valor }).
const camposDe = (registro) => {
  const datos = registro?.datos ?? [];
  return Array.isArray(datos) ? datos : Object.entries(datos).map(([etiqueta, valor]) => ({ etiqueta, valor }));
};

const Fila = ({ etiqueta, valor }) => (
  <Box className='campo-completo' sx={{ display: 'flex', gap: 2, py: 0.5 }}>
    <Typography sx={{ minWidth: 160, color: 'text.secondary' }}>{etiqueta}</Typography>
    <Typography sx={{ whiteSpace: 'pre-line' }}>{valor || '—'}</Typography>
  </Box>
);

Fila.propTypes = { etiqueta: PropTypes.string.isRequired, valor: PropTypes.node };

const OrdenCreador = ({ orden, accion, handleOnClose, updateColeccion, titulo }) => (
  <AppCrudDialog
    stateKey='ordenes'
    registroId={orden}
    accion={accion}
    handleOnClose={handleOnClose}
    updateColeccion={updateColeccion}
    onShow={onShow}
    onCreate={onCreate}
    onUpdate={onUpdate}
    resetActual={resetActual}
    initialValues={initialValues}
    validationSchema={validationSchema}
    transformarAntesDeEnviar={({ id, estado }) => ({ id, estado })}
    maxWidth='md'
  >
    {({ registro, saving }) => (
      <AppCrudForm titulo={`${titulo} #${registro?.id ?? ''}`} accion={accion} handleOnClose={handleOnClose} saving={saving}>
        <SeccionForm titulo='Cliente' />
        <Fila etiqueta='Nombre' valor={registro?.nombre || registro?.contacto?.nombre} />
        <Fila etiqueta='WhatsApp' valor={registro?.telefono ? `+${registro.telefono}` : ''} />
        <Fila etiqueta='Correo' valor={registro?.email} />
        <Fila etiqueta='Dirección' valor={registro?.direccion} />
        <Fila etiqueta='Llegó por' valor={registro?.numero?.nombre} />
        <Fila etiqueta='Fecha' valor={fechaCorta(registro?.fecha_creacion)} />

        <SeccionForm titulo='Lo que pidió' />
        {(registro?.items ?? []).length === 0 && <Fila etiqueta='Productos' valor='No eligió productos' />}
        {(registro?.items ?? []).map((item, i) => (
          <Fila key={i} etiqueta={item.nombre} valor={formatoMoneda(item.precio, registro?.moneda)} />
        ))}
        <Divider className='campo-completo' />
        <Fila etiqueta='Total' valor={<b>{formatoMoneda(registro?.total, registro?.moneda)}</b>} />

        {camposDe(registro).length > 0 && <SeccionForm titulo='Datos que escribió' />}
        {camposDe(registro).map(({ etiqueta, valor }) => (
          <Fila key={etiqueta} etiqueta={etiqueta} valor={String(valor)} />
        ))}

        <SeccionForm titulo='Seguimiento' />
        <MySelectField fullWidth label='Estado' name='estado' disabled={accion === 'ver'} required options={ESTADOS_ORDEN} variant='standard' />
      </AppCrudForm>
    )}
  </AppCrudDialog>
);

OrdenCreador.propTypes = {
  orden: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
};

export default OrdenCreador;
