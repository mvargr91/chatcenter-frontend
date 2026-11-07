import axios from 'axios';
import environment from '../../../env';

const apiConfig = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'X-Negocio': environment.NEGOCIO,
  },
});
export default apiConfig;
