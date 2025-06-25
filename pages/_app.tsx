import React from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { AppProvider } from '../src/context/AppContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { UIProvider } from '../src/context/UIContext';
import LoginForm from '../src/components/LoginForm';
import Toast from '../src/components/Toast';
import ConfirmModal from '../src/components/ConfirmModal';

function AppContent({ Component, pageProps }: AppProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <>
      <Component {...pageProps} />
      <Toast />
      <ConfirmModal />
    </>
  );
}

export default function App(props: AppProps) {
  return (
    <AuthProvider>
      <UIProvider>
        <AppProvider>
          <AppContent {...props} />
        </AppProvider>
      </UIProvider>
    </AuthProvider>
  );
} 