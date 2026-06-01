import axios from 'axios';
import { Platform } from 'react-native';

const envBaseUrl = process.env.EXPO_PUBLIC_API_URL;

export const apiBaseUrl = envBaseUrl
  ? envBaseUrl
  : Platform.OS === 'web'
    ? 'http://localhost:7000'
    : 'http://192.168.0.121:7000';

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
