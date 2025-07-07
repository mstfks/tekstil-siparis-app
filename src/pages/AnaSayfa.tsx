import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useUI } from '../context/UIContext';
import { Siparis, PolarModeli } from '../types';

const AnaSayfa: React.FC = () => {
  const { siparisler, siparisTamamla, siparisIptal, siparisSil, renkler } = useAppContext();
  const { showConfirmModal } = useUI();
  const [seciliSiparis, setSeciliSiparis] = useState<Siparis | null>(null);
  const [siralama, setSiralama] = useState<'yeni-eski' | 'eski-yeni'>('yeni-eski');
  const [aramaMetni, setAramaMetni] = useState<string>('');

  // Helper fonksiyonlar
  const kolTuruMetni = (kol?: string) => {
    if (!kol) return '';
    switch (kol) {
      case 'kisa': return 'Kısa Kol';
      case 'uzun': return 'Uzun Kol';
      case 'yetim': return 'Yetim Kol';
      case 'kisa-ribanali': return 'Kısa Ribanalı';
      default: return kol;
    }
  };

  const yakaTuruMetni = (yaka?: string) => {
    if (!yaka) return '';
    switch (yaka) {
      case 'bisiklet': return 'Bisiklet Yaka';
      case 'v': return 'V Yaka';
      case 'polo': return 'Polo Yaka';
      case 'hakim': return 'Hakim Yaka';
      case 'gomlek': return 'Gömlek Yaka';
      case 'yapma': return 'Yapma Yaka';
      default: return yaka;
    }
  };

  const ucIplikModeliMetni = (model?: string) => {
    if (!model) return '';
    switch (model) {
      case 'dik-yaka-mont': return 'Dik Yaka Mont';
      case 'bisiklet-yaka-sivit': return 'Bisiklet Yaka Sivit';
      case 'kapusonlu-sivit': return 'Kapüşonlu Sivit';
      case 'kisa-fermuarli-sivit': return 'Kısa Fermuarlı Sivit';
      case 'kapusonlu-mont': return 'Kapüşonlu Mont';
      case 'polo-yaka-sivit': return 'Polo Yaka Sivit';
      default: return model;
    }
  };

  const polarModeliMetni = (model?: string) => {
    if (!model) return '';
    switch (model) {
      case 'dik-yaka-mont': return 'Dik Yaka Mont';
      case 'kisa-fermuarli-sivit': return 'Kısa Fermuarlı Sivit';
      case 'kapusonlu-mont': return 'Kapüşonlu Mont';
      case 'sal-70cm': return 'Şal 70 cm';
      case 'sal-90cm': return 'Şal 90 cm';
      default: return model;
    }
  };

  const nakisBaskiMetni = (durum: string) => {
    const durumlar: { [key: string]: string } = {
      'on': 'Ön',
      'on-arka': 'Ön Arka',
      'on-1kol': 'Ön ve 1 Kol',
      'on-kollar': 'Ön ve Kollar',
      'arka': 'Arka',
      'arka-1kol': 'Arka ve 1 Kol',
      'arka-kollar': 'Arka ve Kollar',
      '1kol': '1 Kol',
      'kollar': 'Kollar',
      'on-arka-kollar': 'Ön, Arka ve Kollar',
      'on-arka-1kol': 'Ön, Arka ve Tek Kol',
      'dikilecek': 'Dikilecek',
      'sorulacak': 'Sorulacak'
    };
    return durumlar[durum] || durum;
  };

  const siparisTuruMetni = (tur: string) => {
    switch (tur) {
      case 'suprem': return 'Süprem';
      case 'lakost': return 'Lakost';
      case 'yagmurdesen': return 'Yağmurdesen';
      case '3iplik': return '3 İplik';
      case 'polar': return 'Polar';
      default: return tur;
    }
  };

  // Sadece beklemedeki siparişleri göster, filtrele ve sırala
  const beklemedekiSiparisler = siparisler
    .filter(siparis => siparis.durum === 'beklemede')
    .filter(siparis => {
      if (aramaMetni === '') return true;
      
      const aramaMetniKucuk = aramaMetni.toLowerCase();
      
      // Müşteri ismi
      if (siparis.musteriIsmi.toLowerCase().includes(aramaMetniKucuk)) return true;
      
      // Sipariş numarası
      if (siparis.siparisNo.toString().toLowerCase().includes(aramaMetniKucuk)) return true;
      
      // Renk ismi
      if (siparis.renkIsmi.toLowerCase().includes(aramaMetniKucuk)) return true;
      
      // Sipariş türü
      const siparisTuru = siparisTuruMetni(siparis.siparisTuru).toLowerCase();
      if (siparisTuru.includes(aramaMetniKucuk)) return true;
      
      // Kol türü
      const kolTuru = kolTuruMetni(siparis.kolTuru).toLowerCase();
      if (kolTuru.includes(aramaMetniKucuk)) return true;
      
      // Yaka türü
      const yakaTuru = yakaTuruMetni(siparis.yakaTuru).toLowerCase();
      if (yakaTuru.includes(aramaMetniKucuk)) return true;
      
      // Toplam ürün sayısı
      if (siparis.toplamUrun.toString().includes(aramaMetniKucuk)) return true;
      
      return false;
    })
    .sort((a, b) => {
      if (siralama === 'yeni-eski') {
        return new Date(b.tarih).getTime() - new Date(a.tarih).getTime();
      } else {
        return new Date(a.tarih).getTime() - new Date(b.tarih).getTime();
      }
    });

  const siparisDetayiGoster = (siparis: Siparis) => {
    setSeciliSiparis(siparis);
  };

  const modalKapat = () => {
    setSeciliSiparis(null);
  };

  const handleTamamla = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    siparisTamamla(id);
  };

  const handleIptal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirmModal({
      title: 'Siparişi İptal Et',
      message: 'Bu siparişi iptal etmek istediğinizden emin misiniz?',
      confirmText: 'İptal Et',
      cancelText: 'Vazgeç',
      type: 'warning',
      onConfirm: () => siparisIptal(id)
    });
  };

  const handleModalTamamla = async (id: string) => {
    siparisTamamla(id);
    modalKapat();
  };

  const handleModalIptal = async (id: string) => {
    showConfirmModal({
      title: 'Siparişi İptal Et',
      message: 'Bu siparişi iptal etmek istediğinizden emin misiniz?',
      confirmText: 'İptal Et',
      cancelText: 'Vazgeç',
      type: 'warning',
      onConfirm: () => {
        siparisIptal(id);
        modalKapat();
      }
    });
  };

  const handleModalSil = async (siparis: Siparis) => {
    const confirmMessage = `Bu siparişi tamamen silmek istediğinizden emin misiniz?\n\nSipariş: #${siparis.siparisNo} - ${siparis.musteriIsmi}\nDurum: Beklemede\n\nBu işlem geri alınamaz!`;
    
    showConfirmModal({
      title: 'Siparişi Sil',
      message: confirmMessage,
      confirmText: 'Sil',
      cancelText: 'İptal',
      type: 'danger',
      onConfirm: () => {
        siparisSil(siparis.id);
        modalKapat();
      }
    });
  };

  const handleYazdir = (siparis: Siparis) => {
    // Yazdırma şablonunu oluştur
    const yazdirmaIcerigi = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Sipariş Detayı - ${siparis.siparisNo}</title>
        <style>
          @page {
            size: A5;
            margin: 10mm;
          }
          
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            body {
              margin: 0 !important;
              padding: 0 !important;
            }
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: white;
            color: #333;
            font-size: 14px;
            line-height: 1.4;
          }
          
          .yazdir-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 12px;
            background: white;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 10px;
            margin-bottom: 12px;
            border-bottom: 2px solid #333;
          }
          
          .header-left h1 {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            margin: 0 0 3px 0;
          }
          
          .header-left .urun-ozet {
            font-size: 15px;
            color: #666;
            font-weight: 500;
          }
          
          .header-right {
            text-align: right;
            display: flex;
            flex-direction: column;
            gap: 3px;
          }
          
          .header-right .tarih {
            font-size: 13px;
            color: #666;
          }
          
          .header-right .siparis-no {
            font-size: 17px;
            font-weight: bold;
            color: #333;
            background: #e9ecef;
            padding: 3px 6px;
            border-radius: 3px;
          }
          
          .content {
            display: grid;
            grid-template-columns: 1fr 2fr;
            grid-template-rows: auto auto auto;
            gap: 12px;
            grid-template-areas: 
              "urun-gorseli urun-ozellikleri"
              "beden-tablosu beden-tablosu"
              "notlar notlar";
          }
          
          .urun-gorseli {
            grid-area: urun-gorseli;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 8px;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 180px;
          }
          
          .urun-gorseli img {
            max-width: 100%;
            max-height: 160px;
            object-fit: contain;
            border-radius: 3px;
          }
          
          .urun-gorseli .gorsel-yok {
            text-align: center;
            color: #999;
            font-size: 13px;
            font-style: italic;
          }
          
          .urun-ozellikleri {
            grid-area: urun-ozellikleri;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 8px;
            background: #f8f9fa;
          }
          
          .urun-ozellikleri h3 {
            font-size: 15px;
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #ddd;
          }
          
          .ozellik-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px 0;
            border-bottom: 1px solid #eee;
          }
          
          .ozellik-item:last-child {
            border-bottom: none;
          }
          
          .ozellik-label {
            font-weight: 600;
            color: #555;
            font-size: 13px;
          }
          
          .ozellik-value {
            color: #333;
            font-size: 13px;
            text-align: right;
            font-weight: 500;
          }
          
          .beden-tablosu-container {
            grid-area: beden-tablosu;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 8px;
            background: #f8f9fa;
          }
          
          .beden-tablosu-container h3 {
            font-size: 15px;
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #ddd;
          }
          
          .beden-tablosu {
            display: flex;
            flex-wrap: nowrap;
            gap: 4px;
            margin-top: 8px;
            overflow-x: hidden;
          }
          
          .beden-item {
            border: 1px solid #ddd;
            border-radius: 3px;
            padding: 6px 4px;
            text-align: center;
            background: white;
            flex: 1;
            min-width: 35px;
            max-width: 60px;
          }
          
          .beden-item .beden {
            font-weight: 650;
            color: #333;
            font-size: clamp(16px, 3vw, 20px);
            display: block;
            margin-bottom: 3px;
            padding-bottom: 2px;
            border-bottom: 1px solid #ddd;
          }
          
          .beden-item .adet {
            color: #333;
            font-size: clamp(16px, 3vw, 20px);
            font-weight: 650;
            margin-top: 2px;
          }
          
          .notlar-container {
            grid-area: notlar;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 8px;
            background: #f8f9fa;
          }
          
          .notlar-container h3 {
            font-size: 15px;
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #ddd;
          }
          
          .notlar {
            background: white;
            border: 1px solid #ddd;
            border-radius: 3px;
            padding: 8px;
            font-size: 13px;
            color: #333;
            line-height: 1.4;
            min-height: 40px;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
        </style>
      </head>
      <body>
        <div class="yazdir-container">
          <div class="header">
            <div class="header-left">
              <h1>${siparis.musteriIsmi}</h1>
                              <p class="urun-ozet">${
                siparis.siparisTuru === '3iplik' 
                  ? `${siparisTuruMetni(siparis.siparisTuru)} ${siparis.renkIsmi} ${ucIplikModeliMetni(siparis.ucIplikModeli)}`
                  : siparis.siparisTuru === 'polar' 
                    ? siparis.polarModeli 
                      ? `${siparisTuruMetni(siparis.siparisTuru)} ${siparis.renkIsmi} ${polarModeliMetni(siparis.polarModeli)}`
                      : `${siparisTuruMetni(siparis.siparisTuru)} ${siparis.renkIsmi} (Model Belirtilmemiş)`
                    : `${yakaTuruMetni(siparis.yakaTuru)} ${kolTuruMetni(siparis.kolTuru)} ${siparis.renkIsmi} ${siparisTuruMetni(siparis.siparisTuru)}`
              }</p>
            </div>
            <div class="header-right">
              <div class="tarih">${siparis.tarih.toLocaleDateString('tr-TR')}</div>
              <div class="siparis-no">#${siparis.siparisNo}</div>
            </div>
          </div>
          
          <div class="content">
            <div class="urun-gorseli">
                ${siparis.kombinasyonGorsel ? 
                  `<img src="${siparis.kombinasyonGorsel}" alt="Ürün Görseli" />` : 
                '<div class="gorsel-yok">Görsel<br/>Eklenmemiş</div>'
                }
            </div>
            
            <div class="urun-ozellikleri">
              <h3>Ürün Özellikleri</h3>
              <div class="ozellik-item">
                <span class="ozellik-label">Sipariş Türü:</span>
                <span class="ozellik-value">${siparisTuruMetni(siparis.siparisTuru)}</span>
              </div>
              <div class="ozellik-item">
                <span class="ozellik-label">Renk:</span>
                <span class="ozellik-value">${siparis.renkIsmi}</span>
              </div>
              ${siparis.siparisTuru === '3iplik' ? `
                <div class="ozellik-item">
                  <span class="ozellik-label">Model:</span>
                  <span class="ozellik-value">${ucIplikModeliMetni(siparis.ucIplikModeli)}</span>
                </div>
              ` : siparis.siparisTuru === 'polar' ? `
                <div class="ozellik-item">
                  <span class="ozellik-label">Model:</span>
                  <span class="ozellik-value">${siparis.polarModeli ? polarModeliMetni(siparis.polarModeli) : 'Belirtilmemiş'}</span>
                </div>
              ` : `
                <div class="ozellik-item">
                  <span class="ozellik-label">Kol Türü:</span>
                  <span class="ozellik-value">${kolTuruMetni(siparis.kolTuru)}</span>
                </div>
                <div class="ozellik-item">
                  <span class="ozellik-label">Yaka Türü:</span>
                  <span class="ozellik-value">${yakaTuruMetni(siparis.yakaTuru)}</span>
                </div>
              `}
              <div class="ozellik-item">
                <span class="ozellik-label">Nakış/Baskı:</span>
                <span class="ozellik-value">${nakisBaskiMetni(siparis.nakisBaskiDurumu)}</span>
              </div>
              <div class="ozellik-item">
                <span class="ozellik-label">Toplam Ürün:</span>
                <span class="ozellik-value"><strong>${siparis.toplamUrun} adet</strong></span>
              </div>
            </div>
            
            <div class="beden-tablosu-container">
              <h3>Beden Dağılımı</h3>
              <div class="beden-tablosu">
                ${Object.entries(siparis.bedenTablosu)
                  .filter(([_, adet]) => adet > 0)
                  .map(([beden, adet]) => `
                    <div class="beden-item">
                      <div class="beden">${beden}</div>
                      <div class="adet">${adet}</div>
                    </div>
                  `).join('')}
              </div>
            </div>
            
            ${siparis.not ? `
              <div class="notlar-container">
                  <h3>Notlar</h3>
                <div class="notlar">${siparis.not}</div>
              </div>
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `;

    // Gizli iframe oluştur ve yazdır
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    // İçeriği iframe'e yaz
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(yazdirmaIcerigi);
      iframeDoc.close();

      // Yazdırma işlemini başlat
      setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      // İframe'i temizle
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
      }, 500);
    }
  };

  return (
    <div className="modern-ana-sayfa">
      {/* Header Section */}
      <div className="modern-header">
        <div className="header-content">
          <div className="header-left">
            <div className="title-section">
              <h1 className="page-title">
                <span className="title-icon">📋</span>
                Aktif Siparişler
              </h1>
              <div className="stats-badge">
                <span className="count">{beklemedekiSiparisler.length}</span>
                <span className="label">sipariş</span>
              </div>
            </div>
            <p className="subtitle">Beklemedeki siparişlerinizi yönetin</p>
          </div>
          
          <div className="header-right">
            <div className="controls-group">
              <div className="search-container">
                <div className="search-input-wrapper">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Müşteri, sipariş no, renk ara..."
                    value={aramaMetni}
                    onChange={(e) => setAramaMetni(e.target.value)}
                    className="modern-search-input"
                  />
                  {aramaMetni && (
                    <button
                      className="clear-search-btn"
                      onClick={() => setAramaMetni('')}
                      title="Aramayı temizle"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              
              <button
                className="sort-btn"
                onClick={() => setSiralama(siralama === 'yeni-eski' ? 'eski-yeni' : 'yeni-eski')}
                title={siralama === 'yeni-eski' ? 'Eski siparişleri üstte göster (Eski → Yeni)' : 'Yeni siparişleri üstte göster (Yeni → Eski)'}
              >
                <span className="sort-icon">
                  {siralama === 'yeni-eski' ? '⬇️' : '⬆️'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-area">
        {beklemedekiSiparisler.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <div className="empty-content">
              {aramaMetni ? (
                <>
                  <h3>Sonuç bulunamadı</h3>
                  <p>"{aramaMetni}" araması için sipariş bulunamadı</p>
                  <button 
                    className="clear-filter-btn"
                    onClick={() => setAramaMetni('')}
                  >
                    Filtreyi temizle
                  </button>
                </>
              ) : (
                <>
                  <h3>Henüz aktif sipariş yok</h3>
                  <p>Yeni sipariş oluşturmak için sol menüden "Yeni Sipariş" seçeneğini kullanın</p>
                  <div className="quick-actions">
                    <span className="tip">💡 İpucu: Siparişleriniz burada listelenecek</span>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="orders-list">
            {beklemedekiSiparisler.map((siparis, index) => (
              <div
                key={siparis.id}
                className="modern-order-row"
                onClick={() => siparisDetayiGoster(siparis)}
                style={{ '--animation-delay': `${index * 0.05}s` } as React.CSSProperties}
              >
                <div className="row-content">
                  <div className="row-left">
                    <div className="order-info">
                      <div className="order-header">
                        <span className="order-number">#{siparis.siparisNo}</span>
                        <span className="order-date">{siparis.tarih.toLocaleDateString('tr-TR')}</span>
                      </div>
                      <div className="customer-row">
                        <span className="customer-icon">👤</span>
                        <span className="customer-name">{siparis.musteriIsmi}</span>
                        {siparis.not && siparis.not.trim() && (
                          <span className="note-indicator" title={`Not: ${siparis.not}`}>📝</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="row-center">
                    <div className="product-summary">
                      <div className="quantity-info">
                        <span className="quantity">{siparis.toplamUrun}</span>
                        <span className="unit">adet</span>
                      </div>
                      <div className="product-description">
                        <div className="product-line">
                          {siparis.siparisTuru === '3iplik' 
                            ? `${siparisTuruMetni(siparis.siparisTuru)} ${ucIplikModeliMetni(siparis.ucIplikModeli)}`
                            : siparis.siparisTuru === 'polar' 
                              ? siparis.polarModeli 
                                ? `${siparisTuruMetni(siparis.siparisTuru)} ${polarModeliMetni(siparis.polarModeli)}`
                                : `${siparisTuruMetni(siparis.siparisTuru)} (Model Belirtilmemiş)`
                              : `${yakaTuruMetni(siparis.yakaTuru)} ${kolTuruMetni(siparis.kolTuru)} ${siparisTuruMetni(siparis.siparisTuru)}`
                          }
                        </div>
                        <div className="color-line">
                          <span className="color-label">Renk:</span>
                          <span className="color-value">{siparis.renkIsmi}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row-right">
                    <div className="row-actions">
                      <button
                        className="action-btn print-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleYazdir(siparis);
                        }}
                        title="Yazdır"
                      >
                        <span className="btn-icon">🖨️</span>
                        <span className="btn-text">Yazdır</span>
                      </button>
                      
                      <button
                        className="action-btn complete-btn"
                        onClick={(e) => handleTamamla(siparis.id, e)}
                        title="Siparişi tamamla"
                      >
                        <span className="btn-icon">✓</span>
                        <span className="btn-text">Tamamla</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal - keep existing modal structure */}
      {seciliSiparis && (
        <div className="modal-overlay" onClick={modalKapat}>
          <div className="modern-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modern-modal-header">
              <div className="modal-title-section">
                <h2>
                  <span className="modal-icon">📋</span>
                  Sipariş Detayı
                </h2>
              </div>
              <button className="modern-close-btn" onClick={modalKapat}>
                <span>✕</span>
              </button>
            </div>
            
            <div className="modern-modal-body">
              {/* Üst Kısım - Müşteri ve Tarih Bilgileri */}
              <div className="modal-top-section">
                <div className="customer-header">
                  <div className="customer-info-header">
                    <span className="customer-icon-large">👤</span>
                    <div className="customer-details">
                      <h3 className="customer-name-large">
                        {seciliSiparis.musteriIsmi}
                        <span className="order-number-inline">#{seciliSiparis.siparisNo}</span>
                      </h3>
                      <p className="order-date-large">
                        <span className="date-icon">📅</span>
                        {seciliSiparis.tarih.toLocaleDateString('tr-TR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="quantity-info-large">
                    <span className="quantity-number">{seciliSiparis.toplamUrun}</span>
                    <span className="quantity-label">adet</span>
                  </div>
                </div>
              </div>

              {/* Orta Kısım - Görsel ve Ürün Bilgileri Yan Yana */}
              <div className="modal-middle-section">
                <div className="image-column">
                  <div className="modal-image-container">
                    {seciliSiparis.kombinasyonGorsel ? (
                      <div className="image-wrapper">
                        <img src={seciliSiparis.kombinasyonGorsel} alt="Ürün Görseli" />
                      </div>
                    ) : (
                      <div className="no-image">
                        <span className="no-image-icon">📷</span>
                        <p>Görsel bulunamadı</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="product-column">
                  <div className="product-info-section">
                    <h3 className="section-title">
                      <span className="section-icon">👕</span>
                      Ürün Özellikleri
                    </h3>
                    
                    <div className="product-specs">
                      <div className="spec-item primary">
                        <span className="spec-label">Sipariş Türü</span>
                        <span className="spec-value">{siparisTuruMetni(seciliSiparis.siparisTuru)}</span>
                      </div>
                      
                      <div className="spec-item">
                        <span className="spec-label">Renk</span>
                        <span className="spec-value">{seciliSiparis.renkIsmi}</span>
                      </div>

                      {seciliSiparis.siparisTuru === '3iplik' ? (
                        <div className="spec-item">
                          <span className="spec-label">Model</span>
                          <span className="spec-value">{ucIplikModeliMetni(seciliSiparis.ucIplikModeli)}</span>
                        </div>
                      ) : seciliSiparis.siparisTuru === 'polar' ? (
                        <div className="spec-item">
                          <span className="spec-label">Model</span>
                          <span className="spec-value">{polarModeliMetni(seciliSiparis.polarModeli)}</span>
                        </div>
                      ) : (
                        <>
                          <div className="spec-item">
                            <span className="spec-label">Kol Türü</span>
                            <span className="spec-value">{kolTuruMetni(seciliSiparis.kolTuru)}</span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">Yaka Türü</span>
                            <span className="spec-value">{yakaTuruMetni(seciliSiparis.yakaTuru)}</span>
                          </div>
                        </>
                      )}
                      
                      <div className="spec-item">
                        <span className="spec-label">Nakış/Baskı</span>
                        <span className="spec-value">{nakisBaskiMetni(seciliSiparis.nakisBaskiDurumu)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alt Kısım - Beden Dağılımı ve Notlar */}
              <div className="modal-bottom-section">
                <div className="sizes-section">
                  <h3 className="section-title">
                    <span className="section-icon">📏</span>
                    Beden Dağılımı
                  </h3>
                  <div className="modal-size-grid">
                    {Object.entries(seciliSiparis.bedenTablosu).map(([beden, adet]) => (
                      adet > 0 && (
                        <div key={beden} className="modal-size-item">
                          <div className="size-label">{beden}</div>
                          <div className="size-count">{adet}</div>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {seciliSiparis.not && (
                  <div className="notes-section">
                    <h3 className="section-title">
                      <span className="section-icon">📝</span>
                      Notlar
                    </h3>
                    <div className="notes-content">{seciliSiparis.not}</div>
                  </div>
                )}
              </div>

              <div className="modern-modal-actions">
                <button
                  className="modal-action-btn print"
                  onClick={() => handleYazdir(seciliSiparis)}
                >
                  <span className="btn-icon">🖨️</span>
                  <span className="btn-text">Yazdır</span>
                </button>
                <button
                  className="modal-action-btn complete"
                  onClick={() => handleModalTamamla(seciliSiparis.id)}
                >
                  <span className="btn-icon">✓</span>
                  <span className="btn-text">Tamamla</span>
                </button>
                <button
                  className="modal-action-btn cancel"
                  onClick={() => handleModalIptal(seciliSiparis.id)}
                >
                  <span className="btn-icon">✗</span>
                  <span className="btn-text">İptal Et</span>
                </button>
                <button
                  className="modal-action-btn delete"
                  onClick={() => handleModalSil(seciliSiparis)}
                >
                  <span className="btn-icon">🗑️</span>
                  <span className="btn-text">Sil</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnaSayfa; 