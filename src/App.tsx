import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import AnaSayfa from './pages/AnaSayfa';
import SiparisSayfasi from './pages/SiparisSayfasi';
import GecmisSiparisler from './pages/GecmisSiparisler';
import MusterilerSayfasi from './pages/MusterilerSayfasi';
import RenklerSayfasi from './pages/RenklerSayfasi';
import GorsellerSayfasi from './pages/GorsellerSayfasi';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<AnaSayfa />} />
            <Route path="/yeni-siparis" element={<SiparisSayfasi />} />
            <Route path="/gecmis-siparisler" element={<GecmisSiparisler />} />
            <Route path="/musteriler" element={<MusterilerSayfasi />} />
            <Route path="/renkler" element={<RenklerSayfasi />} />
            <Route path="/gorseller" element={<GorsellerSayfasi />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;
