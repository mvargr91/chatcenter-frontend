import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, Box, Button, Card, ToggleButton, ToggleButtonGroup } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TableRowsIcon from '@mui/icons-material/TableRows';
import AddIcon from '@mui/icons-material/Add';
import jwtAxios from '@crema/services/auth/jwt-auth';
import AppCrudTable, { auditCells } from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import { accionesEnPagina, rutaCrear, rutaEditar } from '../../../shared/components/PaginaCrud';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import { onGetColeccion, onDelete } from '../../../@crema/redux/features/bots/botsSlice';
import { valorActivo, colorActivo, nombreDe, TIPOS_BOT, ACCIONES_BOT } from '../../../shared/constants/Comunes';
import MapaFlujo from './MapaFlujo';
import MensajesPagina from '../../../shared/components/MensajesPagina';

const cells = [
  { id: 'nombre', typeHead: 'string', label: 'Paso', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'tipo', typeHead: 'string', label: 'Tipo', value: (v) => nombreDe(TIPOS_BOT, v), align: 'left', mostrarInicio: true },
  { id: 'accion', typeHead: 'string', label: 'Qué hace', value: (v) => nombreDe(ACCIONES_BOT, v), align: 'left', mostrarInicio: true },
  { id: 'mensaje', typeHead: 'string', label: 'Mensaje', value: (v) => (v ? `${String(v).slice(0, 60)}${String(v).length > 60 ? '…' : ''}` : ''), align: 'left', mostrarInicio: true, ordenable: false },
  { id: 'palabras_clave', typeHead: 'string', label: 'Palabras clave', value: (v) => v ?? '', align: 'left', mostrarInicio: false, ordenable: false },
  { id: 'estado', typeHead: 'string', label: 'Estado', value: valorActivo, cellColor: colorActivo, align: 'left', mostrarInicio: true },
  ...auditCells,
];

const VISTA = 'chatcenter-bots-vista';

const Bots = ({ route }) => {
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const { refreshKey } = useCrudModulo();
  const navigate = useNavigate();
  const [flujo, setFlujo] = useState(null);
  const [vista, setVista] = useState(() => {
    try {
      return localStorage.getItem(VISTA) || 'mapa';
    } catch {
      return 'mapa';
    }
  });

  useEffect(() => {
    jwtAxios.get('bots/flujo').then(({ data }) => setFlujo(data)).catch(() => setFlujo(null));
  }, [refreshKey]);

  const cambiarVista = (_e, valor) => {
    if (!valor) return;
    setVista(valor);
    try {
      localStorage.setItem(VISTA, valor);
    } catch {
      // sin almacenamiento local: solo no se recuerda la vista
    }
  };

  const abrir = useCallback((bot) => navigate(rutaEditar(route.path, bot.id)), [navigate, route.path]);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <ToggleButtonGroup size='small' exclusive value={vista} onChange={cambiarVista}>
          <ToggleButton value='mapa'><AccountTreeIcon sx={{ mr: 1 }} /> Mapa del flujo</ToggleButton>
          <ToggleButton value='tabla'><TableRowsIcon sx={{ mr: 1 }} /> Lista</ToggleButton>
        </ToggleButtonGroup>
        {vista === 'mapa' && permisos.includes('Crear') && (
          <Button variant='contained' startIcon={<AddIcon />} onClick={() => navigate(rutaCrear(route.path))}>Nuevo paso</Button>
        )}
      </Box>

      {flujo?.avisos?.length > 0 && (
        <Alert severity='warning' sx={{ mb: 2 }}>
          <AlertTitle>Revisa tu flujo</AlertTitle>
          {flujo.avisos.map((aviso) => <div key={aviso}>• {aviso}</div>)}
        </Alert>
      )}

      {vista === 'mapa' ? (
        <Card sx={{ p: 2 }}>
          {flujo ? <MapaFlujo bots={flujo.bots} numeros={flujo.numeros} onAbrir={abrir} /> : 'Cargando…'}
          <MensajesPagina />
        </Card>
      ) : (
        <AppCrudTable
          stateKey='bots'
          onGetColeccion={onGetColeccion}
          onDelete={onDelete}
          cells={cells}
          filtrosConfig={[{ name: 'buscar', label: 'Paso, mensaje o palabra clave', type: 'text' }]}
          titulo={titulo}
          urlAyuda={urlAyuda}
          permisos={permisos}
          entidadNombre='Bot'
          defaultOrderBy='nombre:asc'
          refreshKey={refreshKey}
          {...accionesEnPagina(navigate, route.path)}
        />
      )}
    </Box>
  );
};

Bots.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default Bots;
