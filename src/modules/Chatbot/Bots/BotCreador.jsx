import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import { FieldArray } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import AppCrudDialog from '../../../shared/components/AppCrudDialog';
import AppCrudForm, { SeccionForm } from '../../../shared/components/AppCrudForm';
import MyTextField from '../../../shared/components/MyTextField';
import MySelectField from '../../../shared/components/MySelectField';
import MyRadioField from '../../../shared/components/MyRadioField';
import { onShow, onCreate, onUpdate, resetActual, onGetColeccionLigera as onGetBots } from '../../../@crema/redux/features/bots/botsSlice';
import { onGetColeccionLigera as onGetCategorias } from '../../../@crema/redux/features/categorias/categoriasSlice';
import { aRadio, OPCIONES_ESTADO, OPCIONES_SI_NO, TIPOS_BOT, ACCIONES_BOT, LIMITES, nombreDe } from '../../../shared/constants/Comunes';
import VistaPreviaWhatsApp from './VistaPreviaWhatsApp';

const validationSchema = yup.object({
  nombre: yup.string().required('Requerido').max(60).matches(/^[a-z0-9_]+$/, 'Solo minúsculas, números y guion bajo (ej: cita_fecha)'),
  tipo: yup.string().required(),
  accion: yup.string().required(),
  encabezado: yup.string().nullable().max(LIMITES.encabezado, `Máximo ${LIMITES.encabezado} caracteres`),
  pie: yup.string().nullable().max(LIMITES.pie, `Máximo ${LIMITES.pie} caracteres`),
  titulo_lista: yup.string().nullable().max(LIMITES.titulo_lista, `Máximo ${LIMITES.titulo_lista} caracteres`),
  mensaje: yup.string().nullable().max(LIMITES.cuerpo_texto),
  opciones: yup.array().of(
    yup.object({
      titulo: yup.string().required('Escribe el texto').max(LIMITES.fila_titulo, `Máximo ${LIMITES.fila_titulo}`),
      descripcion: yup.string().nullable().max(LIMITES.fila_descripcion, `Máximo ${LIMITES.fila_descripcion}`),
    }),
  ),
});

const initialValues = (registro) => ({
  id: registro?.id ?? '',
  nombre: registro?.nombre ?? '',
  tipo: registro?.tipo ?? 'texto',
  accion: registro?.accion ?? 'ninguna',
  encabezado: registro?.encabezado ?? '',
  mensaje: registro?.mensaje ?? '',
  pie: registro?.pie ?? '',
  titulo_lista: registro?.titulo_lista ?? '',
  opciones: (registro?.opciones ?? []).map((o) => ({ id: o.id, titulo: o.titulo ?? '', descripcion: o.descripcion ?? '', destino: o.destino ?? '' })),
  destino_otro: registro?.destino_otro ?? '',
  siguiente: registro?.siguiente ?? '',
  capturar_como: registro?.capturar_como ?? '',
  avance_automatico: aRadio(registro?.avance_automatico, '0'),
  palabras_clave: registro?.palabras_clave ?? '',
  estado: aRadio(registro?.estado),
});

// Los ids de las opciones son internos: se generan solos y no se muestran.
const nuevoId = (opciones) => {
  let n = opciones.length + 1;
  while (opciones.some((o) => o.id === `op${n}`)) n += 1;
  return `op${n}`;
};

const vacioANull = (v) => (v === '' ? null : v);

const transformar = (d) => ({
  ...d,
  encabezado: vacioANull(d.encabezado),
  pie: vacioANull(d.pie),
  titulo_lista: vacioANull(d.titulo_lista),
  destino_otro: vacioANull(d.destino_otro),
  siguiente: vacioANull(d.siguiente),
  capturar_como: vacioANull(d.capturar_como),
  palabras_clave: vacioANull(d.palabras_clave),
  opciones: d.tipo === 'texto' ? [] : d.opciones.map((o) => ({ ...o, destino: vacioANull(o.destino), descripcion: vacioANull(o.descripcion) })),
});

const etiquetaOtro = (accion) =>
  ({ categorias: 'Cuando elige una categoría, ir a', catalogo: 'Cuando elige un producto o servicio, ir a' })[accion] ??
  'Si elige una opción sin destino, ir a';

const Contador = ({ texto, max }) => {
  const largo = String(texto ?? '').length;
  return (
    <Typography variant='caption' sx={{ color: largo > max ? 'error.main' : 'text.secondary' }}>
      {largo} / {max}
    </Typography>
  );
};

Contador.propTypes = { texto: PropTypes.string, max: PropTypes.number.isRequired };

const BotCreador = ({ bot, accion, handleOnClose, updateColeccion, titulo }) => {
  const dispatch = useDispatch();
  const bots = useSelector((state) => state.bots.coleccionLigera) ?? [];
  const categorias = useSelector((state) => state.categorias.coleccionLigera) ?? [];

  useEffect(() => {
    dispatch(onGetBots());
    dispatch(onGetCategorias({ estado: 1 }));
  }, [dispatch]);

  return (
    <AppCrudDialog
      stateKey='bots'
      registroId={bot}
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
      maxWidth='lg'
    >
      {({ values, saving }) => {
        const disabled = accion === 'ver';
        const destinos = bots.filter((b) => b.nombre !== values.nombre).map((b) => ({ id: b.nombre, nombre: b.nombre }));
        const maxOpciones = values.tipo === 'botones' ? LIMITES.botones : LIMITES.filas;
        const maxTitulo = values.tipo === 'botones' ? LIMITES.boton : LIMITES.fila_titulo;
        const ayudaAccion = ACCIONES_BOT.find((a) => a.id === values.accion)?.ayuda;
        const filasExtra =
          values.accion === 'categorias'
            ? categorias.map((c) => ({ titulo: c.nombre }))
            : values.accion === 'catalogo'
              ? [{ titulo: 'Producto 1', descripcion: '$ precio' }, { titulo: 'Producto 2', descripcion: '$ precio' }]
              : [];

        return (
          <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
            <Box className='campo-completo' sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 340px' }, gap: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, alignContent: 'start' }}>
                <MyTextField autoFocus fullWidth label='Nombre del paso' name='nombre' disabled={disabled} required
                  helperText='Interno, sin espacios: welcome, cita_fecha…' />
                <MySelectField fullWidth label='Tipo de mensaje' name='tipo' disabled={disabled} required options={TIPOS_BOT} variant='standard' />
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <MySelectField fullWidth label='Qué hace este paso' name='accion' disabled={disabled} required options={ACCIONES_BOT} variant='standard' />
                  {ayudaAccion && <Typography variant='caption' color='text.secondary'>{ayudaAccion}</Typography>}
                </Box>

                {values.tipo !== 'texto' && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <MyTextField fullWidth label='Encabezado (opcional)' name='encabezado' disabled={disabled} />
                    <Contador texto={values.encabezado} max={LIMITES.encabezado} />
                  </Box>
                )}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <MyTextField fullWidth multiline minRows={3} label='Mensaje' name='mensaje' disabled={disabled}
                    helperText='Usa *negrita* y _cursiva_ como en WhatsApp' />
                  <Contador texto={values.mensaje} max={values.tipo === 'texto' ? LIMITES.cuerpo_texto : LIMITES.cuerpo_interactivo} />
                </Box>
                {values.tipo !== 'texto' && (
                  <MyTextField fullWidth label='Pie (texto gris, opcional)' name='pie' disabled={disabled} />
                )}
                {values.tipo === 'lista' && (
                  <MyTextField fullWidth label='Título de la lista' name='titulo_lista' disabled={disabled} />
                )}

                {values.tipo !== 'texto' && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <SeccionForm titulo={values.tipo === 'botones' ? 'Botones y a dónde lleva cada uno' : 'Opciones de la lista y a dónde lleva cada una'} />
                    {values.accion === 'categorias' && (
                      <Alert severity='info' sx={{ my: 1 }}>Tus categorías se muestran solas; aquí agrega opciones extra al final (ej: «Hablar con un asesor»).</Alert>
                    )}
                    <FieldArray name='opciones'>
                      {({ push, remove }) => (
                        <>
                          {values.opciones.map((op, i) => (
                            <Box key={op.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: values.tipo === 'lista' ? '1fr 1fr 1fr auto' : '1fr 1fr auto' }, gap: 1, alignItems: 'start', mb: 1 }}>
                              <MyTextField fullWidth label={values.tipo === 'botones' ? `Botón ${i + 1}` : `Opción ${i + 1}`} name={`opciones.${i}.titulo`} disabled={disabled}
                                helperText={`${String(op.titulo).length}/${maxTitulo}`} />
                              {values.tipo === 'lista' && (
                                <MyTextField fullWidth label='Descripción' name={`opciones.${i}.descripcion`} disabled={disabled} />
                              )}
                              <MySelectField fullWidth label='Lleva a' name={`opciones.${i}.destino`} disabled={disabled} options={destinos} ninguno variant='standard' />
                              {!disabled && (
                                <Tooltip title='Quitar'>
                                  <IconButton onClick={() => remove(i)} sx={{ mt: 1 }}><DeleteIcon /></IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          ))}
                          {!disabled && values.opciones.length < maxOpciones && (
                            <Button startIcon={<AddIcon />} size='small'
                              onClick={() => push({ id: nuevoId(values.opciones), titulo: '', descripcion: '', destino: '' })}>
                              Agregar {values.tipo === 'botones' ? 'botón' : 'opción'}
                            </Button>
                          )}
                        </>
                      )}
                    </FieldArray>
                  </Box>
                )}

                <Box sx={{ gridColumn: '1 / -1' }}><SeccionForm titulo='Qué pasa después' /></Box>
                {(values.tipo !== 'texto' || ['categorias', 'catalogo'].includes(values.accion)) && (
                  <MySelectField fullWidth label={etiquetaOtro(values.accion)} name='destino_otro' disabled={disabled} options={destinos} ninguno variant='standard' />
                )}
                <MySelectField fullWidth label='Si el cliente escribe otra cosa, ir a' name='siguiente' disabled={disabled} options={destinos} ninguno variant='standard' />
                <MyTextField fullWidth label='Guardar la respuesta como' name='capturar_como' disabled={disabled}
                  helperText='Ej: Nombre, Dirección, Fecha y hora (aparece en la orden)' />
                <MyRadioField label='¿Pasar solo al siguiente paso, sin esperar respuesta?' name='avance_automatico' disabled={disabled} options={OPCIONES_SI_NO} />
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <MyTextField fullWidth label='Palabras que abren este paso' name='palabras_clave' disabled={disabled}
                    helperText='Separadas por coma: hola, menu, precios. Funcionan en cualquier momento de la conversación.' />
                </Box>
                <MyRadioField label='Estado' name='estado' disabled={disabled} required options={OPCIONES_ESTADO} />
              </Box>

              <Box sx={{ position: { md: 'sticky' }, top: 0, alignSelf: 'start' }}>
                <Typography variant='subtitle2' sx={{ mb: 1 }}>Así lo verá el cliente</Typography>
                <VistaPreviaWhatsApp bot={values} filasExtra={filasExtra} />
                {values.avance_automatico === '1' && values.siguiente && (
                  <Typography variant='caption' color='text.secondary'>Después se envía solo: {nombreDe(destinos, values.siguiente)}</Typography>
                )}
              </Box>
            </Box>
          </AppCrudForm>
        );
      }}
    </AppCrudDialog>
  );
};

BotCreador.propTypes = {
  bot: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
};

export default BotCreador;
