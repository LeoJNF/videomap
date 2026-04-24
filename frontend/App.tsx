import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { MarketplaceProvider } from './src/contexts/MarketplaceContext';
import Routes from './src/navigation/Routes';

export default function App() {
  return (
    <MarketplaceProvider>
      <StatusBar style="dark" />
      <Routes />
    </MarketplaceProvider>
  );
}
