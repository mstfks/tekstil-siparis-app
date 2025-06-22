import React from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { AppProvider } from '../src/context/AppContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import LoginForm from '../src/components/LoginForm';

function AppContent({ Component, pageProps }: AppProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <Component {...pageProps} />;
}

export default function App(props: AppProps) {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent {...props} />
      </AppProvider>
    </AuthProvider>
  );
} 