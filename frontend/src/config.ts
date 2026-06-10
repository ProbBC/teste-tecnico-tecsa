import { Platform } from 'react-native';

/**
 * URL do backend, caso esteja usando emulador usar 10.0.2.2, caso esteja usando dispositivo físico usar o IP da maquina
 * (e.g. http://[IP_ADDRESS])
 */
const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL = `http://${HOST}:9000/api`;
