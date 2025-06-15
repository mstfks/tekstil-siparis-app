import React from 'react';
import { AppProvider } from '../src/context/AppContext';
import Layout from '../src/components/Layout';
import GorsellerSayfasi from '../src/pages/GorsellerSayfasi';

export default function Gorseller() {
  return (
    <AppProvider>
      <Layout>
        <GorsellerSayfasi />
      </Layout>
    </AppProvider>
  );
} 