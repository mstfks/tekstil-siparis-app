import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

const Sidebar = ({ isCollapsed, onToggle, isMobile }: SidebarProps) => {
  const router = useRouter()

  const handleLogout = () => {
    // Token'ları temizle
    Cookies.remove('token');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
    
    // Login sayfasına yönlendir
    router.push('/login');
  };

  const menuItems = [
    {
      href: '/',
      label: 'Ana Sayfa',
      shortLabel: 'Ana',
      icon: (
        <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      href: '/siparis',
      label: 'Yeni Sipariş',
      shortLabel: 'Sipariş',
      icon: (
        <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    {
      href: '/gecmis',
      label: 'Geçmiş Siparişler',
      shortLabel: 'Geçmiş',
      icon: (
        <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      href: '/musteriler',
      label: 'Müşteriler',
      shortLabel: 'Müşteri',
      icon: (
        <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      href: '/renkler',
      label: 'Renkler',
      shortLabel: 'Renk',
      icon: (
        <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      )
    },
    {
      href: '/gorseller',
      label: 'Görseller',
      shortLabel: 'Görsel',
      icon: (
        <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      href: '/analiz',
      label: 'Analiz',
      shortLabel: 'Analiz',
      icon: (
        <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ]

  return (
    <div className={`new-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
      
      {/* Logo ve Başlık */}
      <div className="new-sidebar-header">
        {isCollapsed ? (
          <div className="collapsed-header">
            {/* Küçük Logo */}
            <div className="small-logo">
              <svg style={{width: '16px', height: '16px', color: 'white'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            
            {/* Genişletme Butonu */}
            <button
              onClick={onToggle}
              className="toggle-btn"
              title="Menüyü Genişlet"
            >
              <svg style={{width: '16px', height: '16px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="expanded-header">
            <button
              onClick={onToggle}
              className="toggle-btn-right"
              title="Menüyü Daralt"
            >
              <svg style={{width: '16px', height: '16px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="logo-section">
              <div className="main-logo">
                <svg style={{width: '24px', height: '24px', color: 'white'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="logo-text">
                <h1>ES-ER TEKSTİL</h1>
                <p>Yönetim Paneli</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Menü Öğeleri */}
      <nav className="new-sidebar-nav">
        <ul className="new-menu">
          {menuItems.map((item) => {
            const isActive = router.pathname === item.href
            return (
              <li key={item.href} className={isActive ? 'active' : ''}>
                <Link 
                  href={item.href}
                  className={`menu-link ${isCollapsed ? 'collapsed-link' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <div className="menu-icon">
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="menu-label">{item.label}</span>
                      {isActive && <div className="active-indicator"></div>}
                    </>
                  )}
                  {isCollapsed && isActive && <div className="collapsed-indicator"></div>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Çıkış Yap Bölümü */}
      <div className="new-sidebar-footer">
        <button 
          onClick={handleLogout}
          className={`logout-link ${isCollapsed ? 'collapsed-logout' : ''}`}
          title={isCollapsed ? 'Çıkış Yap' : ''}
        >
          <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isCollapsed && <span>Çıkış Yap</span>}
        </button>
      </div>

      {/* Alt Bilgi */}
      {!isCollapsed && (
        <div className="new-sidebar-bottom">
          <div className="status-info">
            <div className="status-indicator"></div>
            <span>Sistem Aktif</span>
          </div>
          <div className="copyright">
            © 2024 ES-ER TEKSTİL
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar 