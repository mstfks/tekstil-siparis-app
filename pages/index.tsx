import React from 'react';
import { AppProvider } from '../src/context/AppContext';
import Layout from '../src/components/Layout';
import AnaSayfa from '../src/pages/AnaSayfa';

export default function Home() {
  return (
    <AppProvider>
      <Layout>
        <AnaSayfa />
      </Layout>
    </AppProvider>
  );
} 