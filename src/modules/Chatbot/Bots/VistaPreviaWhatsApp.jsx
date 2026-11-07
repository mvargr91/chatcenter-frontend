// Burbuja con el aspecto de WhatsApp: el dueño del negocio ve lo que recibirá el cliente.
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import ListIcon from '@mui/icons-material/FormatListBulleted';

// *negrita* y _cursiva_ como en WhatsApp.
const formato = (texto) =>
  String(texto ?? '')
    .split(/(\*[^*\n]+\*|_[^_\n]+_)/g)
    .map((parte, i) => {
      if (/^\*[^*]+\*$/.test(parte)) return <b key={i}>{parte.slice(1, -1)}</b>;
      if (/^_[^_]+_$/.test(parte)) return <i key={i}>{parte.slice(1, -1)}</i>;
      return <React.Fragment key={i}>{parte}</React.Fragment>;
    });

const VistaPreviaWhatsApp = ({ bot, filasExtra }) => {
  const esLista = bot.tipo === 'lista' || ['categorias', 'catalogo'].includes(bot.accion);
  const esBotones = bot.tipo === 'botones' && !esLista;
  const opciones = bot.opciones ?? [];
  const filas = bot.accion === 'categorias' ? [...filasExtra, ...opciones] : bot.accion === 'catalogo' ? filasExtra : opciones;

  return (
    <Box sx={{ bgcolor: '#E5DDD5', borderRadius: 2, p: 2, minHeight: 160 }}>
      <Box sx={{ bgcolor: '#fff', borderRadius: '0 8px 8px 8px', p: 1.5, maxWidth: 320, boxShadow: '0 1px 1px rgba(0,0,0,.13)', color: '#111' }}>
        {bot.encabezado && <Typography sx={{ fontWeight: 700, mb: 0.5, color: '#111' }}>{bot.encabezado}</Typography>}
        <Typography sx={{ whiteSpace: 'pre-line', fontSize: 14, color: '#111' }}>
          {bot.mensaje ? formato(bot.mensaje) : <i style={{ color: '#999' }}>Escribe el mensaje…</i>}
        </Typography>
        {bot.accion === 'resumen' && <Typography sx={{ fontSize: 12, color: '#777', mt: 1 }}>+ el resumen de lo que eligió y escribió</Typography>}
        {bot.accion === 'total' && <Typography sx={{ fontSize: 14, color: '#111' }}>$ total a pagar</Typography>}
        {bot.pie && <Typography sx={{ fontSize: 12, color: '#8696a0', mt: 0.5 }}>{bot.pie}</Typography>}
        {esLista && (
          <Box sx={{ borderTop: '1px solid #eee', mt: 1, pt: 1, textAlign: 'center', color: '#00a5f4', fontSize: 14 }}>
            <ListIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} /> Ver opciones
          </Box>
        )}
      </Box>
      {esBotones &&
        opciones.slice(0, 3).map((op, i) => (
          <Box key={i} sx={{ bgcolor: '#fff', borderRadius: 2, mt: 0.5, p: 1, maxWidth: 320, textAlign: 'center', color: '#00a5f4', fontSize: 14 }}>
            {op.titulo || `Botón ${i + 1}`}
          </Box>
        ))}
      {esLista && filas.length > 0 && (
        <Box sx={{ bgcolor: '#fff', borderRadius: 2, mt: 1, p: 1, maxWidth: 320 }}>
          <Typography sx={{ fontSize: 12, color: '#008069', fontWeight: 600, mb: 0.5 }}>{bot.titulo_lista || 'Opciones'}</Typography>
          {filas.slice(0, 10).map((fila, i) => (
            <Box key={i} sx={{ py: 0.5, borderBottom: '1px solid #f0f0f0' }}>
              <Typography sx={{ fontSize: 14, color: '#111' }}>{fila.titulo}</Typography>
              {fila.descripcion && <Typography sx={{ fontSize: 12, color: '#8696a0' }}>{fila.descripcion}</Typography>}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

VistaPreviaWhatsApp.propTypes = {
  bot: PropTypes.object.isRequired,
  filasExtra: PropTypes.array,
};

VistaPreviaWhatsApp.defaultProps = { filasExtra: [] };

export default VistaPreviaWhatsApp;
