import React from 'react';
import { AppProvider } from '../src/context/AppContext';
import Layout from '../src/components/Layout';
import RenklerSayfasi from '../src/pages/RenklerSayfasi';

export default function Renkler() {
  return (
    <AppProvider>
      <Layout>
        <RenklerSayfasi />
      </Layout>
    </AppProvider>
  );
} 