import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { registerForPushNotificationsAsync } from '../services/pushNotifications';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  bio?: string;
  city?: string;
  whatsapp?: string;
  isPremium?: boolean;
  premiumSince?: Date;
  isVerified?: boolean;
}

interface AuthContextData {
  signed: boolean;
  token: string | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  updateUser: (userData: User) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    if (!token) return;
    try {
      const response = await api.get('/users/me');
      await updateUser(response.data);
    } catch (error) {
      signOut();
    }
  }

  async function syncPushToken(currentToken?: string) {
    if (!currentToken) return;

    try {
      const expoToken = await registerForPushNotificationsAsync();
      if (!expoToken) return;

      const last = await AsyncStorage.getItem('@VideoMap:pushToken');
      if (last === expoToken) return;

      await api.put('/users/me/push-token', { token: expoToken });
      await AsyncStorage.setItem('@VideoMap:pushToken', expoToken);
    } catch (error) {
      // Silencioso: push não pode bloquear o app
      console.log('Erro ao registrar push token:', error);
    }
  }

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedToken = await AsyncStorage.getItem('@VideoMap:token');
        const storedUser = await AsyncStorage.getItem('@VideoMap:user');

        if (storedToken && storedUser) {
          api.defaults.headers.Authorization = `Bearer ${storedToken}`;
          setUser(JSON.parse(storedUser));
          setToken(storedToken);

          // Atualiza usuário do backend (premium/verified/perfil)
          try {
            const response = await api.get('/users/me');
            setUser(response.data);
            await AsyncStorage.setItem('@VideoMap:user', JSON.stringify(response.data));
          } catch {
            // Token inválido/expirado
            setUser(null);
            setToken(null);
            delete api.defaults.headers.Authorization;
            await AsyncStorage.clear();
          }
        }
      } catch (error) {
        console.log('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStorageData();
  }, []);

  useEffect(() => {
    // Sempre que logar/carregar token, tenta registrar push
    if (token) {
      syncPushToken(token);
    }
  }, [token]);

  async function signIn(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { access_token, user: userData } = response.data;

      setUser(userData);
      setToken(access_token);

      api.defaults.headers.Authorization = `Bearer ${access_token}`;

      await AsyncStorage.setItem('@VideoMap:token', access_token);
      await AsyncStorage.setItem('@VideoMap:user', JSON.stringify(userData));

      // best-effort: registra token de push
      syncPushToken(access_token);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
  }

  function signOut() {
    setUser(null);
    setToken(null);
    delete api.defaults.headers.Authorization;
    AsyncStorage.clear();
  }

  async function updateUser(userData: User) {
    setUser(userData);
    await AsyncStorage.setItem('@VideoMap:user', JSON.stringify(userData));
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, token, user, loading, signIn, signOut, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}