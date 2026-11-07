// Chat del panel: bandeja de conversaciones (por número de WhatsApp) y respuesta del asesor.
// Se actualiza cada pocos segundos pidiendo solo lo nuevo.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
  Avatar, Badge, Box, Button, Card, Chip, Divider, IconButton, InputAdornment, List, ListItemButton, ListItemAvatar,
  ListItemText, MenuItem, TextField, Tooltip, Typography, useMediaQuery,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DoneIcon from '@mui/icons-material/Done';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import jwtAxios from '@crema/services/auth/jwt-auth';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import { showMessage } from '../../../@crema/redux/features/cammon/commonSlice';
import { extraerMensajeError } from '../../../@crema/redux/helpers/createCrudSlice';
import { ERROR_TYPE, UPDATE_TYPE } from '../../../shared/constants/Constantes';
import { MODOS_CONVERSACION, colorDe, nombreDe, fechaCorta } from '../../../shared/constants/Comunes';
import MensajesPagina from '../../../shared/components/MensajesPagina';

const REFRESCO_MS = 4000;

const iniciales = (texto) =>
  String(texto || '?').replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9 ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '?';

const nombreContacto = (c) => c?.contacto?.nombre || `+${c?.contacto?.telefono ?? ''}`;

const EstadoEnvio = ({ estado }) => {
  if (estado === 'fallido') return <Tooltip title='WhatsApp no aceptó este mensaje'><ErrorOutlineIcon sx={{ fontSize: 14, color: 'error.main' }} /></Tooltip>;
  if (estado === 'leido') return <DoneAllIcon sx={{ fontSize: 14, color: '#53bdeb' }} />;
  if (estado === 'entregado') return <DoneAllIcon sx={{ fontSize: 14, color: '#8696a0' }} />;
  return <DoneIcon sx={{ fontSize: 14, color: '#8696a0' }} />;
};

EstadoEnvio.propTypes = { estado: PropTypes.string };

const Burbuja = ({ mensaje }) => {
  const entrante = mensaje.direccion === 'entrante';
  const autor = { bot: '🤖 Bot', ia: '✨ Asistente IA', asesor: '👤 Asesor' }[mensaje.autor];
  return (
    <Box sx={{ display: 'flex', justifyContent: entrante ? 'flex-start' : 'flex-end', mb: 1 }}>
      <Box sx={{ maxWidth: '75%', bgcolor: entrante ? '#fff' : '#d9fdd3', color: '#111', px: 1.5, py: 1, borderRadius: 2, boxShadow: '0 1px 1px rgba(0,0,0,.1)' }}>
        {!entrante && autor && <Typography sx={{ fontSize: 11, color: '#008069', fontWeight: 600 }}>{autor}{mensaje.bot ? ` · ${mensaje.bot}` : ''}</Typography>}
        <Typography sx={{ whiteSpace: 'pre-line', fontSize: 14, wordBreak: 'break-word', color: '#111' }}>{mensaje.contenido}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5 }}>
          <Typography sx={{ fontSize: 11, color: '#8696a0' }}>{fechaCorta(mensaje.created_at)}</Typography>
          {!entrante && <EstadoEnvio estado={mensaje.estado_envio} />}
        </Box>
      </Box>
    </Box>
  );
};

Burbuja.propTypes = { mensaje: PropTypes.object.isRequired };

const Chat = ({ route }) => {
  const { permisos } = usePermisosOpcion(route.path);
  const dispatch = useDispatch();
  const movil = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [conversaciones, setConversaciones] = useState([]);
  const [numeros, setNumeros] = useState([]);
  const [filtros, setFiltros] = useState({ buscar: '', whatsapp_numero_id: '', modo: '' });
  const [activa, setActiva] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const fondo = useRef(null);
  const puedeResponder = permisos.includes('Responder');
  const puedeCambiarModo = permisos.includes('Modificar');

  const cargarConversaciones = useCallback(() => {
    const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== ''));
    jwtAxios.get('conversaciones', { params: { ...params, limite: 100 } })
      .then(({ data }) => setConversaciones(data.datos ?? []))
      .catch(() => {});
  }, [filtros]);

  useEffect(() => {
    jwtAxios.get('numeros-whatsapp', { params: { ligera: 1 } }).then(({ data }) => setNumeros(data)).catch(() => {});
  }, []);

  useEffect(() => {
    cargarConversaciones();
    const id = setInterval(cargarConversaciones, REFRESCO_MS);
    return () => clearInterval(id);
  }, [cargarConversaciones]);

  // Mensajes de la conversación abierta: primero los últimos 50 y luego solo los nuevos.
  useEffect(() => {
    if (!activa) return undefined;
    let vigente = true;
    let ultimoId = 0;
    jwtAxios.get(`conversaciones/${activa.id}/mensajes`, { params: { limite: 50 } }).then(({ data }) => {
      if (!vigente) return;
      const ordenados = [...data].reverse();
      ultimoId = ordenados.length ? ordenados[ordenados.length - 1].id : 0;
      setMensajes(ordenados);
    });
    const id = setInterval(() => {
      jwtAxios.get(`conversaciones/${activa.id}/mensajes`, { params: { despues_de: ultimoId } }).then(({ data }) => {
        if (vigente && data.length) {
          ultimoId = data[data.length - 1].id;
          setMensajes((previos) => [...previos, ...data.filter((m) => !previos.some((p) => p.id === m.id))]);
        }
      }).catch(() => {});
    }, REFRESCO_MS);
    return () => {
      vigente = false;
      clearInterval(id);
    };
  }, [activa?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fondo.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes.length]);

  // Mantiene el modo de la conversación abierta al día con la bandeja.
  useEffect(() => {
    if (activa) {
      const actual = conversaciones.find((c) => c.id === activa.id);
      if (actual && actual.modo !== activa.modo) setActiva(actual);
    }
  }, [conversaciones]); // eslint-disable-line react-hooks/exhaustive-deps

  const enviar = async () => {
    if (!texto.trim() || !activa) return;
    setEnviando(true);
    try {
      const { data } = await jwtAxios.post(`conversaciones/${activa.id}/responder`, { texto: texto.trim() });
      setMensajes((previos) => [...previos, data.datos]);
      setTexto('');
      setActiva({ ...activa, modo: 'asesor' });
      cargarConversaciones();
    } catch (error) {
      dispatch(showMessage([extraerMensajeError(error), ERROR_TYPE]));
    } finally {
      setEnviando(false);
    }
  };

  const cambiarModo = async (modo) => {
    try {
      const { data } = await jwtAxios.put(`conversaciones/${activa.id}/modo`, { modo });
      setActiva({ ...activa, modo });
      dispatch(showMessage([data.mensajes[0], UPDATE_TYPE]));
      cargarConversaciones();
    } catch (error) {
      dispatch(showMessage([extraerMensajeError(error), ERROR_TYPE]));
    }
  };

  const bandeja = (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Box sx={{ p: 1.5, display: 'grid', gap: 1 }}>
        <TextField size='small' placeholder='Buscar por nombre o teléfono' value={filtros.buscar}
          onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value })}
          InputProps={{ startAdornment: <InputAdornment position='start'><SearchIcon fontSize='small' /></InputAdornment> }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          {numeros.length > 1 && (
            <TextField select size='small' fullWidth label='Número' value={filtros.whatsapp_numero_id}
              onChange={(e) => setFiltros({ ...filtros, whatsapp_numero_id: e.target.value })}>
              <MenuItem value=''>Todos</MenuItem>
              {numeros.map((n) => <MenuItem key={n.id} value={n.id}>{n.nombre}</MenuItem>)}
            </TextField>
          )}
          <TextField select size='small' fullWidth label='Atiende' value={filtros.modo} onChange={(e) => setFiltros({ ...filtros, modo: e.target.value })}>
            <MenuItem value=''>Todos</MenuItem>
            {MODOS_CONVERSACION.map((m) => <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>)}
          </TextField>
        </Box>
      </Box>
      <Divider />
      <List sx={{ overflowY: 'auto', flex: 1, py: 0 }}>
        {conversaciones.length === 0 && (
          <Typography sx={{ p: 2 }} color='text.secondary'>Aún no hay conversaciones. Aparecen aquí cuando un cliente escribe a tu WhatsApp.</Typography>
        )}
        {conversaciones.map((c) => (
          <ListItemButton key={c.id} selected={activa?.id === c.id} onClick={() => setActiva(c)} data-conversacion={c.id}>
            <ListItemAvatar>
              <Badge overlap='circular' variant='dot' invisible={c.modo !== 'asesor'} color='warning'>
                <Avatar sx={{ bgcolor: colorDe(MODOS_CONVERSACION, c.modo) }}>{iniciales(nombreContacto(c))}</Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <Typography noWrap sx={{ fontWeight: c.ultima_direccion === 'entrante' ? 700 : 400 }}>{nombreContacto(c)}</Typography>
                <Typography variant='caption' color='text.secondary' sx={{ flexShrink: 0 }}>{fechaCorta(c.ultimo_mensaje_at)}</Typography>
              </Box>}
              secondary={<Box component='span' sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <Typography component='span' variant='body2' noWrap color='text.secondary'>{c.ultimo_mensaje}</Typography>
                {numeros.length > 1 && <Chip component='span' size='small' label={c.numero?.nombre} sx={{ height: 18, fontSize: 10 }} />}
              </Box>}
            />
          </ListItemButton>
        ))}
      </List>
    </Card>
  );

  const conversacion = activa ? (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        {movil && <IconButton onClick={() => setActiva(null)}><ArrowBackIcon /></IconButton>}
        <Avatar sx={{ bgcolor: colorDe(MODOS_CONVERSACION, activa.modo) }}>{iniciales(nombreContacto(activa))}</Avatar>
        <Box sx={{ flex: 1, minWidth: 140 }}>
          <Typography sx={{ fontWeight: 700 }}>{nombreContacto(activa)}</Typography>
          <Typography variant='caption' color='text.secondary'>
            +{activa.contacto?.telefono} · por {activa.numero?.nombre} · atiende: <b data-modo={activa.modo}>{nombreDe(MODOS_CONVERSACION, activa.modo)}</b>
          </Typography>
        </Box>
        {puedeCambiarModo && activa.modo !== 'asesor' && (
          <Button size='small' variant='contained' color='warning' startIcon={<SupportAgentIcon />} onClick={() => cambiarModo('asesor')}>Atender yo</Button>
        )}
        {puedeCambiarModo && activa.modo !== 'bot' && (
          <Button size='small' startIcon={<SmartToyIcon />} onClick={() => cambiarModo('bot')}>Devolver al bot</Button>
        )}
        {puedeCambiarModo && activa.modo !== 'ia' && (
          <Button size='small' startIcon={<PsychologyIcon />} onClick={() => cambiarModo('ia')}>Pasar a la IA</Button>
        )}
      </Box>
      <Divider />
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#efeae2' }}>
        {mensajes.map((m) => <Burbuja key={m.id} mensaje={m} />)}
        <div ref={fondo} />
      </Box>
      {puedeResponder && (
        <Box sx={{ p: 1.5, display: 'flex', gap: 1 }}>
          <TextField fullWidth size='small' multiline maxRows={4} placeholder='Escribe una respuesta…' value={texto} name='respuesta'
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } }}
            helperText={activa.modo !== 'asesor' ? 'Al responder, el bot deja de contestar esta conversación.' : ' '} />
          <IconButton color='primary' onClick={enviar} disabled={enviando || !texto.trim()} aria-label='Enviar'><SendIcon /></IconButton>
        </Box>
      )}
    </Card>
  ) : (
    <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Typography color='text.secondary'>Elige una conversación para verla.</Typography>
    </Card>
  );

  return (
    <Box sx={{ height: 'calc(100vh - 140px)', minHeight: 480, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '360px 1fr' }, gap: 2 }}>
      {(!movil || !activa) && bandeja}
      {(!movil || activa) && conversacion}
      <MensajesPagina />
    </Box>
  );
};

Chat.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default Chat;
