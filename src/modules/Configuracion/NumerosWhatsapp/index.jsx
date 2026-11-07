import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import WifiTetheringIcon from '@mui/icons-material/WifiTethering';
import jwtAxios from '@crema/services/auth/jwt-auth';
import AppCrudTable, { auditCells } from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import { accionesEnPagina } from '../../../shared/components/PaginaCrud';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import { onGetColeccion, onDelete } from '../../../@crema/redux/features/numerosWhatsapp/numerosWhatsappSlice';
import { showMessage } from '../../../@crema/redux/features/cammon/commonSlice';
import { extraerMensajeError } from '../../../@crema/redux/helpers/createCrudSlice';
import { valorActivo, colorActivo, valorSiNo } from '../../../shared/constants/Comunes';
import { ERROR_TYPE, UPDATE_TYPE } from '../../../shared/constants/Constantes';

const cells = [
  { id: 'nombre', typeHead: 'string', label: 'Nombre', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'numero', typeHead: 'string', label: 'Número', value: (v) => v || '—', align: 'left', mostrarInicio: true, ordenable: false },
  { id: 'bot_inicial', typeHead: 'string', label: 'Primer mensaje', value: (v) => v || 'Sin elegir', align: 'left', mostrarInicio: true, ordenable: false },
  { id: 'moneda', typeHead: 'string', label: 'Moneda', value: (v) => v, align: 'center', mostrarInicio: true, ordenable: false },
  { id: 'ia_por_defecto', typeHead: 'string', label: 'Atiende la IA', value: valorSiNo, align: 'center', mostrarInicio: false, ordenable: false },
  { id: 'estado', typeHead: 'string', label: 'Estado', value: valorActivo, cellColor: colorActivo, align: 'left', mostrarInicio: true },
  ...auditCells,
];

const NumerosWhatsapp = ({ route }) => {
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const { refreshKey } = useCrudModulo();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cupo, setCupo] = useState(null);

  useEffect(() => {
    jwtAxios.get('numeros-whatsapp/cupo').then(({ data }) => setCupo(data)).catch(() => {});
  }, [refreshKey]);

  const probar = async (row) => {
    try {
      const { data } = await jwtAxios.post(`numeros-whatsapp/${row.id}/probar`);
      const info = data.datos ?? {};
      dispatch(showMessage([`¡Conexión correcta! ${info.nombre_verificado ?? ''} ${info.numero ?? ''}`.trim(), UPDATE_TYPE]));
    } catch (error) {
      dispatch(showMessage([extraerMensajeError(error), ERROR_TYPE]));
    }
  };

  const lleno = cupo && cupo.usados >= cupo.permitidos;

  return (
    <AppCrudTable
      stateKey='numerosWhatsapp'
      onGetColeccion={onGetColeccion}
      onDelete={onDelete}
      cells={cells}
      titulo={titulo}
      subtitulo={
        cupo
          ? `Usas ${cupo.usados} de ${cupo.permitidos} número(s) que permite tu plan.${lleno ? ' Para conectar otro, escríbenos y ampliamos tu plan.' : ''}`
          : 'Los números por los que tus clientes te escriben.'
      }
      urlAyuda={urlAyuda}
      permisos={lleno ? permisos.filter((p) => p !== 'Crear') : permisos}
      entidadNombre='WhatsappNumero'
      refreshKey={refreshKey}
      accionesExtra={[{ titulo: 'Probar conexión con WhatsApp', icono: WifiTetheringIcon, onClick: probar, permiso: 'Modificar' }]}
      {...accionesEnPagina(navigate, route.path)}
    />
  );
};

NumerosWhatsapp.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default NumerosWhatsapp;
