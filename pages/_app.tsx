import React from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { AppProvider } from '../src/context/AppContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  );
} 