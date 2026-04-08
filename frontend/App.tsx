import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import Routes from './src/navigation/Routes';
import { configureNotifications } from './src/services/pushNotifications';

configureNotifications();

export default function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}