import axios from 'axios';
import { Platform } from 'react-native';

// ⚠️ MUDE O IP AQUI (use ipconfig no Windows)
const envBaseUrl = process.env.EXPO_PUBLIC_API_URL;

const baseURL = envBaseUrl
  ? envBaseUrl
  : Platform.OS === 'web' 
    ? 'http://localhost:7000'
    : 'http://192.168.0.121:7000'; // ⬅️ COLOQUE SEU IP AQUI


const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;