import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import Sidebar from '../../Sidebar';
import Toast from './Toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isCollapsed, setIsCollapsed, toggleSidebar } = useUI();
  const [isMobile, setIsMobile] = useState(false);

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
        
        <Sidebar 
          isCollapsed={isCollapsed} 
          onToggle={toggleSidebar} 
          isMobile={isMobile} 
        />
        
        <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
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
        <Toast />
      </div>
    </>
  );
};

export default Layout; 