import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';
import { Capacitor } from '@capacitor/core';

// Initialize jeep-sqlite web components for web platform
const platform = Capacitor.getPlatform();
if (platform === 'web') {
  jeepSqlite(window);
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);