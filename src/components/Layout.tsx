import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isCollapsed, setIsCollapsed, toggleSidebar } = useUI();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile && !isCollapsed) {
        setIsCollapsed(true); // Mobilde başlangıçta daraltılmış
      }
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [isCollapsed, setIsCollapsed]);

  const menuItems = [
    { 
      path: '/', 
      label: 'Ana Sayfa', 
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      )
    },
    { 
      path: '/siparis', 
      label: 'Yeni Sipariş', 
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
      )
    },
    { 
      path: '/gecmis', 
      label: 'Geçmiş Siparişler', 
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
      )
    },
    { 
      path: '/musteriler', 
      label: 'Müşteriler', 
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h3v-3c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v3h3v4H4zm12-5.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0 4c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
        </svg>
      )
    },
    { 
      path: '/renkler', 
      label: 'Renkler', 
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,3C13.05,3 14.05,3.4 14.83,4.17C15.6,4.95 16,5.95 16,7H20A2,2 0 0,1 22,9V10A2,2 0 0,1 20,12H16C16,13.05 15.6,14.05 14.83,14.83C14.05,15.6 13.05,16 12,16C10.95,16 9.95,15.6 9.17,14.83C8.4,14.05 8,13.05 8,12C8,10.95 8.4,9.95 9.17,9.17C9.95,8.4 10.95,8 12,8V3M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z"/>
        </svg>
      )
    },
    { 
      path: '/gorseller', 
      label: 'Görseller', 
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
        </svg>
      )
    },
    { 
      path: '/analiz', 
      label: 'Analiz', 
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M2,2V22H22V20H4V2H2M7,10H9V20H7V10M11,6H13V20H11V6M15,13H17V20H15V13M19,9H21V20H19V9Z"/>
        </svg>
      )
    },
  ];

  return (
    <>
      <Head>
        <title>ES-ER TEKSTİL SİPARİŞ</title>
      </Head>
      <div className="layout">
        {isMobile && !isCollapsed && (
          <div 
            className="sidebar-overlay" 
            onClick={() => setIsCollapsed(true)}
          />
        )}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <svg viewBox="0 0 24 24" fill="currentColor" className="logo-icon">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
            </svg>
            {!isCollapsed && (
              <div className="logo-text">
                <h2>ES-ER TEKSTİL</h2>
                <p>Sipariş Yönetim Sistemi</p>
              </div>
            )}
          </div>
        </div>
        <nav className="sidebar-nav">
          <ul className="menu">
            {menuItems.map((item) => (
              <li key={item.path} className={router.pathname === item.path ? 'active' : ''}>
                <Link href={item.path} title={isCollapsed ? item.label : ''}>
                  <span className="menu-icon">{item.icon}</span>
                  {!isCollapsed && <span className="menu-label">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          {!isCollapsed && user && (
            <div className="user-info">
              <span>Hoşgeldin, {user.username}</span>
              <button 
                className="logout-btn" 
                onClick={logout}
                title="Çıkış Yap"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
                </svg>
                Çıkış
              </button>
            </div>
          )}
          <button 
            className="collapse-btn" 
            onClick={toggleSidebar}
            title={isCollapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              {isCollapsed ? (
                <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
              ) : (
                <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"/>
              )}
            </svg>
          </button>
        </div>
      </aside>
      <main className="main-content">
        {isMobile && (
          <button 
            className="mobile-menu-toggle"
            onClick={toggleSidebar}
            title="Menü"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/>
            </svg>
          </button>
        )}
        {children}
      </main>
    </div>
    </>
  );
};

export default Layout; 