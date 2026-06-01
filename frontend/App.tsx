import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { MarketplaceProvider } from './src/contexts/MarketplaceContext';
import Routes from './src/navigation/Routes';
import { configureNotifications } from './src/services/pushNotifications';

export default function App() {
  useEffect(() => {
    configureNotifications();
  }, []);

  return (
    <MarketplaceProvider>
      <StatusBar style="dark" />
      <Routes />
    </MarketplaceProvider>
  );
}
