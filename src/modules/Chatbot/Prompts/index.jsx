import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import AppCrudTable, { auditCells } from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import { accionesEnPagina } from '../../../shared/components/PaginaCrud';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import { onGetColeccion, onDelete } from '../../../@crema/redux/features/prompts/promptsSlice';
import { valorActivo, colorActivo } from '../../../shared/constants/Comunes';

const cells = [
  { id: 'titulo', typeHead: 'string', label: 'Título', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'estado', typeHead: 'string', label: 'En uso', value: valorActivo, cellColor: colorActivo, align: 'left', mostrarInicio: true },
  ...auditCells,
];

const Prompts = ({ route }) => {
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const { refreshKey } = useCrudModulo();
  const navigate = useNavigate();

  return (
    <AppCrudTable
      stateKey='prompts'
      onGetColeccion={onGetColeccion}
      onDelete={onDelete}
      cells={cells}
      filtrosConfig={[{ name: 'buscar', label: 'Título', type: 'text' }]}
      titulo={titulo}
      subtitulo='Instrucciones para el asistente IA. Solo una está activa; tu catálogo con precios se le agrega solo.'
      urlAyuda={urlAyuda}
      permisos={permisos}
      entidadNombre='Prompt'
      refreshKey={refreshKey}
      {...accionesEnPagina(navigate, route.path)}
    />
  );
};

Prompts.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default Prompts;
