import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AppCrudTable, { auditCells } from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import { accionesEnPagina } from '../../../shared/components/PaginaCrud';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import { onGetColeccion, onDelete } from '../../../@crema/redux/features/productos/productosSlice';
import { onGetColeccionLigera as onGetCategorias } from '../../../@crema/redux/features/categorias/categoriasSlice';
import { valorActivo, colorActivo, formatoMoneda, nombreDe, TIPOS_PRODUCTO } from '../../../shared/constants/Comunes';

const cells = [
  { id: 'nombre', typeHead: 'string', label: 'Nombre', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'categoria', typeHead: 'string', label: 'Categoría', value: (v) => v?.nombre ?? '', align: 'left', mostrarInicio: true, ordenable: false },
  { id: 'tipo', typeHead: 'string', label: 'Tipo', value: (v) => nombreDe(TIPOS_PRODUCTO, v), align: 'left', mostrarInicio: true, ordenable: false },
  { id: 'precio', typeHead: 'numeric', label: 'Precio', value: (v) => formatoMoneda(v), align: 'right', mostrarInicio: true },
  { id: 'duracion_minutos', typeHead: 'numeric', label: 'Duración', value: (v) => (v ? `${v} min` : ''), align: 'center', mostrarInicio: false, ordenable: false },
  { id: 'estado', typeHead: 'string', label: 'Estado', value: valorActivo, cellColor: colorActivo, align: 'left', mostrarInicio: true },
  ...auditCells,
];

const Productos = ({ route }) => {
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const { refreshKey } = useCrudModulo();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const categorias = useSelector((state) => state.categorias.coleccionLigera) ?? [];

  useEffect(() => {
    dispatch(onGetCategorias());
  }, [dispatch]);

  const filtrosConfig = [
    { name: 'buscar', label: 'Nombre', type: 'text' },
    { name: 'categoria_id', label: 'Categoría', type: 'select', options: categorias.map((c) => ({ id: c.id, nombre: c.nombre })) },
    { name: 'tipo', label: 'Tipo', type: 'select', options: TIPOS_PRODUCTO },
  ];

  return (
    <AppCrudTable
      stateKey='productos'
      onGetColeccion={onGetColeccion}
      onDelete={onDelete}
      cells={cells}
      filtrosConfig={filtrosConfig}
      titulo={titulo}
      subtitulo='Lo que el cliente puede elegir en el chat. El precio aparece debajo del nombre.'
      urlAyuda={urlAyuda}
      permisos={permisos}
      entidadNombre='Producto'
      defaultOrderBy='nombre:asc'
      refreshKey={refreshKey}
      {...accionesEnPagina(navigate, route.path)}
    />
  );
};

Productos.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default Productos;
