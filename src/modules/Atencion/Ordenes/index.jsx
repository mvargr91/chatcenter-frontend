import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AppCrudTable from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import { accionesEnPagina } from '../../../shared/components/PaginaCrud';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import { onGetColeccion } from '../../../@crema/redux/features/ordenes/ordenesSlice';
import { onGetColeccionLigera as onGetNumeros } from '../../../@crema/redux/features/numerosWhatsapp/numerosWhatsappSlice';
import { ESTADOS_ORDEN, nombreDe, colorDe, formatoMoneda, fechaCorta } from '../../../shared/constants/Comunes';

const resumenItems = (items) => (items?.length ? items.map((i) => i.nombre).join(', ') : '—');

const cells = [
  { id: 'id', typeHead: 'numeric', label: 'N.°', value: (v) => `#${v}`, align: 'left', mostrarInicio: true },
  { id: 'nombre', typeHead: 'string', label: 'Cliente', value: (v, row) => v || row?.contacto?.nombre || `+${row?.contacto?.telefono ?? ''}`, align: 'left', mostrarInicio: true, ordenable: false },
  { id: 'items', typeHead: 'string', label: 'Pidió', value: resumenItems, align: 'left', mostrarInicio: true, ordenable: false },
  { id: 'total', typeHead: 'numeric', label: 'Total', value: (v, row) => formatoMoneda(v, row?.moneda), align: 'right', mostrarInicio: true },
  { id: 'estado', typeHead: 'string', label: 'Estado', value: (v) => nombreDe(ESTADOS_ORDEN, v), cellColor: (v) => colorDe(ESTADOS_ORDEN, v), align: 'left', mostrarInicio: true },
  { id: 'numero', typeHead: 'string', label: 'Llegó por', value: (v) => v?.nombre ?? '', align: 'left', mostrarInicio: false, ordenable: false },
  { id: 'fecha_creacion', typeHead: 'string', label: 'Fecha', value: fechaCorta, align: 'left', mostrarInicio: true },
];

const Ordenes = ({ route }) => {
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const { refreshKey } = useCrudModulo();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const numeros = useSelector((state) => state.numerosWhatsapp.coleccionLigera) ?? [];

  useEffect(() => {
    dispatch(onGetNumeros());
  }, [dispatch]);

  const filtrosConfig = [
    { name: 'buscar', label: 'Cliente, teléfono o dirección', type: 'text' },
    { name: 'estado_orden', label: 'Estado', type: 'select', options: ESTADOS_ORDEN },
    ...(numeros.length > 1 ? [{ name: 'whatsapp_numero_id', label: 'Número', type: 'select', options: numeros.map((n) => ({ id: n.id, nombre: n.nombre })) }] : []),
    { name: 'desde', label: 'Desde', type: 'date' },
    { name: 'hasta', label: 'Hasta', type: 'date' },
  ];

  return (
    <AppCrudTable
      stateKey='ordenes'
      onGetColeccion={onGetColeccion}
      cells={cells}
      filtrosConfig={filtrosConfig}
      titulo={titulo}
      subtitulo='Pedidos, reservas, citas y cotizaciones que el bot registró al mostrar el resumen.'
      urlAyuda={urlAyuda}
      permisos={permisos.filter((p) => !['Crear', 'Eliminar'].includes(p))}
      entidadNombre='Orden'
      defaultOrderBy='fecha_creacion:desc'
      refreshKey={refreshKey}
      {...accionesEnPagina(navigate, route.path, { crear: false })}
    />
  );
};

Ordenes.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default Ordenes;
