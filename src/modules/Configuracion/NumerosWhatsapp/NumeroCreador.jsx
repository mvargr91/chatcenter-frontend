import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from '@mui/material';
import AppCrudDialog from '../../../shared/components/AppCrudDialog';
import AppCrudForm, { SeccionForm } from '../../../shared/components/AppCrudForm';
import MyTextField from '../../../shared/components/MyTextField';
import MySelectField from '../../../shared/components/MySelectField';
import MyRadioField from '../../../shared/components/MyRadioField';
import { onShow, onCreate, onUpdate, resetActual } from '../../../@crema/redux/features/numerosWhatsapp/numerosWhatsappSlice';
import { onGetColeccionLigera as onGetBots } from '../../../@crema/redux/features/bots/botsSlice';
import { aRadio, OPCIONES_ESTADO, OPCIONES_SI_NO, MONEDAS } from '../../../shared/constants/Comunes';

const esquema = (nuevo) =>
  yup.object({
    nombre: yup.string().required('Requerido').max(60),
    phone_number_id: yup.string().required('Requerido').matches(/^[0-9]{5,40}$/, 'Solo números: cópialo de WhatsApp Manager'),
    waba_id: yup.string().nullable().matches(/^[0-9]{5,40}$/, { message: 'Solo números', excludeEmptyString: true }),
    token: nuevo ? yup.string().required('Requerido').min(20, 'El token parece incompleto') : yup.string().nullable(),
    moneda: yup.string().required('Requerido'),
  });

const initialValues = (registro) => ({
  id: registro?.id ?? '',
  nombre: registro?.nombre ?? '',
  numero: registro?.numero ?? '',
  phone_number_id: registro?.phone_number_id ?? '',
  waba_id: registro?.waba_id ?? '',
  token: '',
  bot_inicial: registro?.bot_inicial ?? '',
  bot_archivo: registro?.bot_archivo ?? '',
  moneda: registro?.moneda ?? 'COP',
  ia_por_defecto: aRadio(registro?.ia_por_defecto, '0'),
  estado: aRadio(registro?.estado),
});

const transformar = (datos) => ({
  ...datos,
  bot_inicial: datos.bot_inicial || null,
  bot_archivo: datos.bot_archivo || null,
  waba_id: datos.waba_id || null,
});

const NumeroCreador = ({ numero, accion, handleOnClose, updateColeccion, titulo }) => {
  const dispatch = useDispatch();
  const bots = useSelector((state) => state.bots.coleccionLigera) ?? [];

  useEffect(() => {
    dispatch(onGetBots({ estado: 1 }));
  }, [dispatch]);

  const opcionesBots = bots.map((b) => ({ id: b.nombre, nombre: b.nombre }));

  return (
    <AppCrudDialog
      stateKey='numerosWhatsapp'
      registroId={numero}
      accion={accion}
      handleOnClose={handleOnClose}
      updateColeccion={updateColeccion}
      onShow={onShow}
      onCreate={onCreate}
      onUpdate={onUpdate}
      resetActual={resetActual}
      initialValues={initialValues}
      validationSchema={esquema(accion === 'crear')}
      transformarAntesDeEnviar={transformar}
      maxWidth='md'
    >
      {({ saving }) => {
        const disabled = accion === 'ver';
        return (
          <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
            <MyTextField autoFocus fullWidth label='Nombre interno' name='nombre' disabled={disabled} required helperText='Ej: Ventas, Soporte, Sede norte' />
            <MyTextField fullWidth label='Número visible' name='numero' disabled={disabled} helperText='Se completa solo al probar la conexión' />

            <SeccionForm titulo='Conexión con Meta' />
            {!disabled && (
              <Alert severity='info' className='campo-completo'>
                En <b>developers.facebook.com</b> → tu app → <b>WhatsApp → Configuración de la API</b> copia el
                <b> Identificador del número de teléfono</b> y un <b>token de acceso permanente</b> (de un usuario del sistema).
              </Alert>
            )}
            <MyTextField fullWidth label='Identificador del número (Phone number ID)' name='phone_number_id' disabled={disabled} required />
            <MyTextField fullWidth label='Identificador de la cuenta (WABA ID)' name='waba_id' disabled={disabled} />
            <MyTextField className='campo-completo' fullWidth type='password' label='Token de acceso' name='token' disabled={disabled}
              required={accion === 'crear'} autoComplete='new-password'
              helperText={accion === 'crear' ? 'Se guarda cifrado y nunca se vuelve a mostrar.' : 'Déjalo vacío para conservar el token guardado.'} />

            <SeccionForm titulo='Cómo atiende este número' />
            <MySelectField fullWidth label='Primer mensaje (bot inicial)' name='bot_inicial' disabled={disabled} options={opcionesBots} ninguno variant='standard'
              helperText='Lo que recibe un cliente al escribir por primera vez' />
            <MySelectField fullWidth label='Respuesta cuando envían un archivo' name='bot_archivo' disabled={disabled} options={opcionesBots} ninguno variant='standard' />
            <MySelectField fullWidth label='Moneda de los precios' name='moneda' disabled={disabled} required options={MONEDAS} variant='standard' />
            <MyRadioField label='¿Atiende el asistente IA desde el inicio?' name='ia_por_defecto' disabled={disabled} options={OPCIONES_SI_NO} />
            <MyRadioField label='Estado' name='estado' disabled={disabled} required options={OPCIONES_ESTADO} />
          </AppCrudForm>
        );
      }}
    </AppCrudDialog>
  );
};

NumeroCreador.propTypes = {
  numero: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
};

export default NumeroCreador;
