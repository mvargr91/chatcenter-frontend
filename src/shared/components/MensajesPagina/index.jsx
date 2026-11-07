// Mensajes de éxito/error (commonSlice) en páginas que no usan AppCrudTable.
import React from 'react';
import { useSelector } from 'react-redux';
import AppMessageView from '@crema/components/AppMessageView';
import { CREATE_TYPE, ERROR_TYPE, UPDATE_TYPE } from '../../constants/Constantes';

const MensajesPagina = () => {
  const { message, messageType } = useSelector(({ common }) => common);
  return (
    <AppMessageView
      variant={messageType === ERROR_TYPE ? 'error' : 'success'}
      message={[UPDATE_TYPE, CREATE_TYPE, ERROR_TYPE].includes(messageType) ? message : ''}
    />
  );
};

export default MensajesPagina;
