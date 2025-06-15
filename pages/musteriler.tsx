import React from 'react';
import { AppProvider } from '../src/context/AppContext';
import Layout from '../src/components/Layout';
import MusterilerSayfasi from '../src/pages/MusterilerSayfasi';

export default function Musteriler() {
  return (
    <AppProvider>
      <Layout>
        <MusterilerSayfasi />
      </Layout>
    </AppProvider>
  );
} 