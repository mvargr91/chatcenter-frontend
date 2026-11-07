import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
  Alert, Box, Button, Card, CardActions, CardContent, Checkbox, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControlLabel, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/RestaurantMenu';
import StoreIcon from '@mui/icons-material/Storefront';
import WorkIcon from '@mui/icons-material/Work';
import EventIcon from '@mui/icons-material/EventAvailable';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import jwtAxios from '@crema/services/auth/jwt-auth';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import { showMessage } from '../../../@crema/redux/features/cammon/commonSlice';
import { extraerMensajeError } from '../../../@crema/redux/helpers/createCrudSlice';
import { ERROR_TYPE, UPDATE_TYPE } from '../../../shared/constants/Constantes';
import { MONEDAS } from '../../../shared/constants/Comunes';
import MapaFlujo from '../Bots/MapaFlujo';
import MensajesPagina from '../../../shared/components/MensajesPagina';

const ICONOS = { restaurante: RestaurantIcon, tienda: StoreIcon, servicios: WorkIcon, citas: EventIcon };

const Plantillas = ({ route }) => {
  const { titulo, permisos } = usePermisosOpcion(route.path);
  const dispatch = useDispatch();
  const [plantillas, setPlantillas] = useState([]);
  const [respaldos, setRespaldos] = useState([]);
  const [numeros, setNumeros] = useState([]);
  const [verFlujo, setVerFlujo] = useState(null);
  const [aplicar, setAplicar] = useState(null);
  const [form, setForm] = useState({ negocio: '', moneda: 'COP', catalogo: true, prompt: true, whatsapp_numero_id: '' });
  const [enviando, setEnviando] = useState(false);
  const puedeAplicar = permisos.includes('Aplicar');

  const cargar = useCallback(() => {
    jwtAxios.get('plantillas-negocio').then(({ data }) => setPlantillas(data)).catch(() => {});
    jwtAxios.get('plantillas-negocio/respaldos').then(({ data }) => setRespaldos(data)).catch(() => {});
    jwtAxios.get('numeros-whatsapp', { params: { ligera: 1 } }).then(({ data }) => setNumeros(data)).catch(() => {});
  }, []);

  useEffect(cargar, [cargar]);

  const mensaje = (texto, tipo) => dispatch(showMessage([texto, tipo]));

  const confirmarAplicar = async () => {
    setEnviando(true);
    try {
      const { data } = await jwtAxios.post(`plantillas-negocio/${aplicar.codigo}/aplicar`, {
        ...form,
        whatsapp_numero_id: form.whatsapp_numero_id || null,
      });
      mensaje(data.mensajes[0], UPDATE_TYPE);
      setAplicar(null);
      cargar();
    } catch (error) {
      mensaje(extraerMensajeError(error), ERROR_TYPE);
    } finally {
      setEnviando(false);
    }
  };

  const restaurar = async (respaldo) => {
    if (!window.confirm(`¿Volver a como estaba el ${respaldo.fecha}? Lo actual también se respalda.`)) return;
    try {
      const { data } = await jwtAxios.post(`plantillas-negocio/respaldos/${respaldo.nombre}/restaurar`);
      mensaje(data.mensajes[0], UPDATE_TYPE);
      cargar();
    } catch (error) {
      mensaje(extraerMensajeError(error), ERROR_TYPE);
    }
  };

  return (
    <Box>
      <Typography variant='h5' sx={{ mb: 1 }}>{titulo || 'Plantillas de negocio'}</Typography>
      <Typography color='text.secondary' sx={{ mb: 3 }}>
        Elige el tipo de negocio y el chatbot queda listo con mensajes, botones y un catálogo de ejemplo.
        Después cambias los textos en <b>Flujo del bot</b> y los precios en <b>Productos y servicios</b>.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
        {plantillas.map((p) => {
          const Icono = ICONOS[p.codigo] ?? AutoAwesomeIcon;
          return (
            <Card key={p.codigo} sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                  <Icono color='primary' fontSize='large' />
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>{p.nombre}</Typography>
                    <Chip size='small' label={p.tipo} />
                  </Box>
                </Box>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>{p.descripcion}</Typography>
                <Typography variant='caption' display='block'>{p.pasos} pasos · {p.categorias.length} categorías de ejemplo</Typography>
              </CardContent>
              <CardActions>
                <Button size='small' onClick={() => setVerFlujo(p)}>Ver flujo</Button>
                {puedeAplicar && (
                  <Button size='small' variant='contained' data-plantilla={p.codigo}
                    onClick={() => { setForm((f) => ({ ...f, negocio: f.negocio })); setAplicar(p); }}>
                    Usar esta plantilla
                  </Button>
                )}
              </CardActions>
            </Card>
          );
        })}
      </Box>

      <Typography variant='h6' sx={{ mb: 1 }}>Respaldos automáticos</Typography>
      <Card>
        {respaldos.length === 0 ? (
          <Typography sx={{ p: 2 }} color='text.secondary'>Todavía no hay respaldos. Se guarda uno cada vez que aplicas una plantilla.</Typography>
        ) : (
          <Table size='small'>
            <TableHead>
              <TableRow><TableCell>Fecha</TableCell><TableCell>Motivo</TableCell><TableCell>Pasos</TableCell><TableCell>Productos</TableCell><TableCell /></TableRow>
            </TableHead>
            <TableBody>
              {respaldos.slice(0, 15).map((r) => (
                <TableRow key={r.nombre}>
                  <TableCell>{r.fecha}</TableCell>
                  <TableCell>{r.motivo}</TableCell>
                  <TableCell>{r.bots}</TableCell>
                  <TableCell>{r.productos}</TableCell>
                  <TableCell align='right'>{puedeAplicar && <Button size='small' onClick={() => restaurar(r)}>Restaurar</Button>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={!!verFlujo} onClose={() => setVerFlujo(null)} maxWidth='lg' fullWidth>
        <DialogTitle>Flujo: {verFlujo?.nombre}</DialogTitle>
        <DialogContent>
          {verFlujo && (
            <MapaFlujo
              bots={verFlujo.bots.map((b, i) => ({ ...b, id: i, estado: true }))}
              numeros={[{ nombre: 'tu número', bot_inicial: verFlujo.bot_inicial }]}
              onAbrir={() => {}}
            />
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setVerFlujo(null)}>Cerrar</Button></DialogActions>
      </Dialog>

      <Dialog open={!!aplicar} onClose={() => !enviando && setAplicar(null)} maxWidth='sm' fullWidth>
        <DialogTitle>{aplicar?.nombre}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
          <TextField label='Nombre del negocio' name='negocio' value={form.negocio} required autoFocus inputProps={{ maxLength: 40 }}
            onChange={(e) => setForm({ ...form, negocio: e.target.value })} helperText='Aparece en el saludo y en los mensajes del chatbot.' />
          <TextField select label='Moneda de los precios' value={form.moneda} onChange={(e) => setForm({ ...form, moneda: e.target.value })}>
            {MONEDAS.map((m) => <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>)}
          </TextField>
          {numeros.length > 1 && (
            <TextField select label='Aplicar a' value={form.whatsapp_numero_id} onChange={(e) => setForm({ ...form, whatsapp_numero_id: e.target.value })}>
              <MenuItem value=''>Todos los números</MenuItem>
              {numeros.map((n) => <MenuItem key={n.id} value={n.id}>{n.nombre}</MenuItem>)}
            </TextField>
          )}
          <FormControlLabel control={<Checkbox checked={form.catalogo} onChange={(e) => setForm({ ...form, catalogo: e.target.checked })} />}
            label='Cargar categorías y productos de ejemplo (desmárcalo si ya tienes tu catálogo)' />
          {aplicar?.tiene_prompt && (
            <FormControlLabel control={<Checkbox checked={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.checked })} />}
              label='Instalar las instrucciones del asistente IA' />
          )}
          <Alert severity='warning'>
            Esto <b>reemplaza todos los pasos del bot</b>{form.catalogo && ' y el catálogo'}. Las conversaciones, contactos y órdenes no se tocan.
            Se guarda un respaldo automático.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAplicar(null)} disabled={enviando}>Cancelar</Button>
          <Button variant='contained' onClick={confirmarAplicar} disabled={enviando || !form.negocio.trim()}>
            {enviando ? 'Aplicando…' : 'Aplicar plantilla'}
          </Button>
        </DialogActions>
      </Dialog>
      <MensajesPagina />
    </Box>
  );
};

Plantillas.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default Plantillas;
