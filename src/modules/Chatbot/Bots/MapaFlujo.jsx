// Mapa del flujo: desde el primer mensaje de cada número, los pasos por niveles con sus flechas.
// Pensado para que alguien no técnico entienda el recorrido del cliente de un vistazo.
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardActionArea, Chip, Typography } from '@mui/material';
import { ACCIONES_BOT, nombreDe } from '../../../shared/constants/Comunes';

const flechas = (bot) => {
  const lista = (bot.opciones ?? []).filter((o) => o.destino).map((o) => ({ etiqueta: o.titulo, destino: o.destino }));
  if (bot.destino_otro) {
    lista.push({
      etiqueta: { categorias: 'Elige una categoría', catalogo: 'Elige un producto' }[bot.accion] ?? 'Otra opción',
      destino: bot.destino_otro,
    });
  }
  if (bot.siguiente) {
    lista.push({ etiqueta: bot.avance_automatico ? 'Pasa solo' : 'Escribe otra cosa', destino: bot.siguiente, suave: true });
  }
  return lista;
};

/** Niveles por recorrido en anchura desde el primer mensaje. */
const niveles = (bots, inicio) => {
  const porNombre = Object.fromEntries(bots.map((b) => [b.nombre, b]));
  const visto = new Set([inicio]);
  const resultado = [];
  let actual = porNombre[inicio] ? [inicio] : [];
  while (actual.length) {
    resultado.push(actual);
    const siguiente = [];
    actual.forEach((nombre) => {
      flechas(porNombre[nombre]).forEach(({ destino, suave }) => {
        // "conversation"/asesor y pasos con avance automático se muestran igual; se evita repetir.
        if (porNombre[destino] && !visto.has(destino) && !(suave && destino === inicio)) {
          visto.add(destino);
          siguiente.push(destino);
        }
      });
    });
    actual = siguiente;
  }
  return { resultado, visto };
};

const Paso = ({ bot, esInicio, onAbrir, nombres }) => (
  <Card variant='outlined' sx={{ width: 250, borderColor: esInicio ? 'success.main' : 'divider', borderWidth: esInicio ? 2 : 1 }}>
    <CardActionArea onClick={() => onAbrir(bot)} sx={{ p: 1.5, alignItems: 'flex-start' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}>{bot.nombre}</Typography>
        {esInicio && <Chip size='small' color='success' label='Inicio' />}
        {!bot.estado && <Chip size='small' label='Inactivo' />}
      </Box>
      {bot.accion !== 'ninguna' && (
        <Typography variant='caption' color='secondary.main' display='block'>⚡ {nombreDe(ACCIONES_BOT, bot.accion)}</Typography>
      )}
      <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {bot.mensaje || '—'}
      </Typography>
      {bot.capturar_como && <Typography variant='caption' display='block'>✎ Guarda: {bot.capturar_como}</Typography>}
      {flechas(bot).map((f, i) => (
        <Typography key={i} variant='caption' display='block' sx={{ color: nombres.has(f.destino) ? (f.suave ? 'text.secondary' : 'primary.main') : 'error.main' }}>
          ➜ {f.etiqueta} → <b>{f.destino}</b>{!nombres.has(f.destino) && ' (no existe)'}
        </Typography>
      ))}
    </CardActionArea>
  </Card>
);

Paso.propTypes = {
  bot: PropTypes.object.isRequired,
  esInicio: PropTypes.bool,
  onAbrir: PropTypes.func.isRequired,
  nombres: PropTypes.instanceOf(Set).isRequired,
};

const MapaFlujo = ({ bots, numeros, onAbrir }) => {
  const porNombre = useMemo(() => Object.fromEntries(bots.map((b) => [b.nombre, b])), [bots]);
  const nombres = useMemo(() => new Set(bots.map((b) => b.nombre)), [bots]);
  const inicios = [...new Set(numeros.map((n) => n.bot_inicial).filter(Boolean))];
  const alcanzados = new Set();

  const secciones = inicios.map((inicio) => {
    const { resultado, visto } = niveles(bots, inicio);
    visto.forEach((n) => alcanzados.add(n));
    return { inicio, resultado, numeros: numeros.filter((n) => n.bot_inicial === inicio).map((n) => n.nombre) };
  });
  const sueltos = bots.filter((b) => !alcanzados.has(b.nombre));

  return (
    <Box>
      {secciones.length === 0 && (
        <Typography color='text.secondary' sx={{ mb: 2 }}>
          Ningún número tiene primer mensaje. Elige su bot inicial en Configuración → Números de WhatsApp.
        </Typography>
      )}
      {secciones.map(({ inicio, resultado, numeros: deEste }) => (
        <Box key={inicio} sx={{ mb: 4 }}>
          <Typography variant='subtitle1' sx={{ mb: 1 }}>Recorrido de: <b>{deEste.join(', ')}</b></Typography>
          {resultado.map((nivel, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, pl: { md: i * 2 } }}>
              {i > 0 && <Typography sx={{ alignSelf: 'center', color: 'text.disabled', fontSize: 24 }}>↳</Typography>}
              {nivel.map((nombre) => (
                <Paso key={nombre} bot={porNombre[nombre]} esInicio={nombre === inicio} onAbrir={onAbrir} nombres={nombres} />
              ))}
            </Box>
          ))}
        </Box>
      ))}
      {sueltos.length > 0 && (
        <Box>
          <Typography variant='subtitle1' sx={{ mb: 1 }}>Pasos que se abren con palabras clave o que ningún paso usa</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {sueltos.map((bot) => <Paso key={bot.nombre} bot={bot} onAbrir={onAbrir} nombres={nombres} />)}
          </Box>
        </Box>
      )}
    </Box>
  );
};

MapaFlujo.propTypes = {
  bots: PropTypes.array.isRequired,
  numeros: PropTypes.array.isRequired,
  onAbrir: PropTypes.func.isRequired,
};

export default MapaFlujo;
