import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import AppCrudTable, { auditCells } from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import { accionesEnPagina } from '../../../shared/components/PaginaCrud';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import { onGetColeccion, onDelete } from '../../../@crema/redux/features/categorias/categoriasSlice';
import { valorActivo, colorActivo } from '../../../shared/constants/Comunes';

const cells = [
  { id: 'nombre', typeHead: 'string', label: 'Nombre', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'productos_count', typeHead: 'numeric', label: 'Productos', value: (v) => v ?? 0, align: 'center', mostrarInicio: true, ordenable: false },
  { id: 'orden', typeHead: 'numeric', label: 'Orden en el chat', value: (v) => v, align: 'center', mostrarInicio: true },
  { id: 'estado', typeHead: 'string', label: 'Estado', value: valorActivo, cellColor: colorActivo, align: 'left', mostrarInicio: true },
  ...auditCells,
];

const filtrosConfig = [{ name: 'buscar', label: 'Nombre', type: 'text' }];

const Categorias = ({ route }) => {
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const { refreshKey } = useCrudModulo();
  const navigate = useNavigate();

  return (
    <AppCrudTable
      stateKey='categorias'
      onGetColeccion={onGetColeccion}
      onDelete={onDelete}
      cells={cells}
      filtrosConfig={filtrosConfig}
      titulo={titulo}
      subtitulo='Así se agrupan tus productos o servicios en la lista que ve el cliente en WhatsApp (máximo 10).'
      urlAyuda={urlAyuda}
      permisos={permisos}
      entidadNombre='Categoria'
      defaultOrderBy='orden:asc'
      refreshKey={refreshKey}
      {...accionesEnPagina(navigate, route.path)}
    />
  );
};

Categorias.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default Categorias;
