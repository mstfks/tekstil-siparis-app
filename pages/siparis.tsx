import React from 'react';
import { AppProvider } from '../src/context/AppContext';
import Layout from '../src/components/Layout';
import SiparisSayfasi from '../src/pages/SiparisSayfasi';

export default function Siparis() {
  return (
    <AppProvider>
      <Layout>
        <SiparisSayfasi />
      </Layout>
    </AppProvider>
  );
} 