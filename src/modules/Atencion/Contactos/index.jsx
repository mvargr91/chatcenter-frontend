import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import AppCrudTable from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import { accionesEnPagina } from '../../../shared/components/PaginaCrud';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import { onGetColeccion } from '../../../@crema/redux/features/contactos/contactosSlice';
import { fechaCorta } from '../../../shared/constants/Comunes';

const cells = [
  { id: 'nombre', typeHead: 'string', label: 'Nombre', value: (v) => v || 'Sin nombre', align: 'left', mostrarInicio: true },
  { id: 'telefono', typeHead: 'string', label: 'WhatsApp', value: (v) => `+${v}`, align: 'left', mostrarInicio: true },
  { id: 'conversaciones_count', typeHead: 'numeric', label: 'Conversaciones', value: (v) => v ?? 0, align: 'center', mostrarInicio: true, ordenable: false },
  { id: 'fecha_creacion', typeHead: 'string', label: 'Primer mensaje', value: fechaCorta, align: 'left', mostrarInicio: true },
];

const Contactos = ({ route }) => {
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const { refreshKey } = useCrudModulo();
  const navigate = useNavigate();

  return (
    <AppCrudTable
      stateKey='contactos'
      onGetColeccion={onGetColeccion}
      cells={cells}
      filtrosConfig={[{ name: 'buscar', label: 'Nombre o teléfono', type: 'text' }]}
      titulo={titulo}
      subtitulo='Se agregan solos cuando alguien escribe por WhatsApp.'
      urlAyuda={urlAyuda}
      permisos={permisos.filter((p) => !['Crear', 'Eliminar'].includes(p))}
      entidadNombre='Contacto'
      refreshKey={refreshKey}
      {...accionesEnPagina(navigate, route.path, { crear: false })}
    />
  );
};

Contactos.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default Contactos;
