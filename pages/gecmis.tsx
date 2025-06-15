import React from 'react';
import { AppProvider } from '../src/context/AppContext';
import Layout from '../src/components/Layout';
import GecmisSiparisler from '../src/pages/GecmisSiparisler';

export default function Gecmis() {
  return (
    <AppProvider>
      <Layout>
        <GecmisSiparisler />
      </Layout>
    </AppProvider>
  );
} 