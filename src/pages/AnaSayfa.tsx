import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Siparis, PolarModeli } from '../types';

const AnaSayfa: React.FC = () => {
  const { siparisler, siparisTamamla, siparisIptal, siparisSil, renkler } = useAppContext();
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
    if (window.confirm('Bu siparişi tamamlandı olarak işaretlemek istediğinizden emin misiniz?')) {
      await siparisTamamla(id);
    }
  };

  const handleIptal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) {
      await siparisIptal(id);
    }
  };

  const handleModalTamamla = async (id: string) => {
    if (window.confirm('Bu siparişi tamamlandı olarak işaretlemek istediğinizden emin misiniz?')) {
      await siparisTamamla(id);
      modalKapat();
    }
  };

  const handleModalIptal = async (id: string) => {
    if (window.confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) {
      await siparisIptal(id);
      modalKapat();
    }
  };

  const handleModalSil = async (siparis: Siparis) => {
    const confirmMessage = `Bu siparişi tamamen silmek istediğinizden emin misiniz?\n\nSipariş: #${siparis.siparisNo} - ${siparis.musteriIsmi}\nDurum: Beklemede\n\nBu işlem geri alınamaz!`;
    
    if (window.confirm(confirmMessage)) {
      await siparisSil(siparis.id);
      modalKapat();
    }
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
    <div className="ana-sayfa">
      <div className="sayfa-header">
        <div className="header-sol">
          <h1>Aktif Siparişler</h1>
          <p>Toplam {beklemedekiSiparisler.length} aktif sipariş</p>
        </div>
        <div className="header-sag">
          <div className="arama-siralama-grup">
            <div className="arama-container">
              <input
                type="text"
                placeholder="Müşteri, sipariş no, renk, ürün türü ara..."
                value={aramaMetni}
                onChange={(e) => setAramaMetni(e.target.value)}
                className="arama-input"
              />
              {aramaMetni && (
                <button
                  className="temizle-btn"
                  onClick={() => setAramaMetni('')}
                  title="Aramayı temizle"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              className="siralama-btn"
              onClick={() => setSiralama(siralama === 'yeni-eski' ? 'eski-yeni' : 'yeni-eski')}
              title={siralama === 'yeni-eski' ? 'Eski siparişleri üstte göster' : 'Yeni siparişleri üstte göster'}
            >
              {siralama === 'yeni-eski' ? '↓' : '↑'}
            </button>
          </div>
        </div>
      </div>

      {beklemedekiSiparisler.length === 0 ? (
        <div className="bos-liste">
          {aramaMetni ? (
            <p>"{aramaMetni}" araması için sonuç bulunamadı.</p>
          ) : (
            <>
              <p>Henüz aktif sipariş bulunmuyor.</p>
              <p>Yeni sipariş oluşturmak için sol menüden "Yeni Sipariş" seçeneğini kullanın.</p>
            </>
          )}
        </div>
      ) : (
        <div className="siparis-listesi">
          {beklemedekiSiparisler.map((siparis) => (
            <div
              key={siparis.id}
              className="siparis-kart"
              onClick={() => siparisDetayiGoster(siparis)}
            >
              <div className="siparis-bilgi">
                <div className="siparis-baslik">
                  <h3>{siparis.musteriIsmi} #{siparis.siparisNo} - {siparis.tarih.toLocaleDateString('tr-TR')}</h3>
                </div>
                <div className="siparis-detaylar">
                  <p>{siparis.toplamUrun} adet {
                    siparis.siparisTuru === '3iplik' 
                      ? `${siparisTuruMetni(siparis.siparisTuru)} ${siparis.renkIsmi} ${ucIplikModeliMetni(siparis.ucIplikModeli)}`
                      : siparis.siparisTuru === 'polar' 
                        ? siparis.polarModeli 
                          ? `${siparisTuruMetni(siparis.siparisTuru)} ${siparis.renkIsmi} ${polarModeliMetni(siparis.polarModeli)}`
                          : `${siparisTuruMetni(siparis.siparisTuru)} ${siparis.renkIsmi} (Model Belirtilmemiş)`
                        : `${yakaTuruMetni(siparis.yakaTuru)} ${kolTuruMetni(siparis.kolTuru)} ${siparis.renkIsmi} ${siparisTuruMetni(siparis.siparisTuru)}`
                  }</p>
                </div>
              </div>
              <div className="siparis-actions">
                <button
                  className="yazdir-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleYazdir(siparis);
                  }}
                  title="Yazdır"
                >
                  🖨️
                </button>
                <button
                  className="tamamla-btn"
                  onClick={(e) => handleTamamla(siparis.id, e)}
                  title="Siparişi tamamla"
                >
                  ✓
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {seciliSiparis && (
        <div className="modal-overlay" onClick={modalKapat}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Sipariş Detayı #{seciliSiparis.siparisNo}</h2>
              <button className="kapat-btn" onClick={modalKapat}>×</button>
            </div>
            <div className="modal-body">
              <div className="detay-grup">
                <h3>Müşteri Bilgileri</h3>
                <p><strong>Müşteri:</strong> {seciliSiparis.musteriIsmi}</p>
                <p><strong>Sipariş Tarihi:</strong> {seciliSiparis.tarih.toLocaleDateString('tr-TR')}</p>
                <p><strong>Sipariş Türü:</strong> {siparisTuruMetni(seciliSiparis.siparisTuru)}</p>
              </div>

              <div className="detay-grup">
                <h3>Ürün Bilgileri</h3>
                <p><strong>Renk:</strong> {seciliSiparis.renkIsmi}</p>
                {seciliSiparis.siparisTuru === '3iplik' ? (
                  <p><strong>Model:</strong> {ucIplikModeliMetni(seciliSiparis.ucIplikModeli)}</p>
                ) : seciliSiparis.siparisTuru === 'polar' ? (
                  <p><strong>Model:</strong> {polarModeliMetni(seciliSiparis.polarModeli)}</p>
                ) : (
                  <>
                    <p><strong>Kol Türü:</strong> {kolTuruMetni(seciliSiparis.kolTuru)}</p>
                    <p><strong>Yaka Türü:</strong> {yakaTuruMetni(seciliSiparis.yakaTuru)}</p>
                  </>
                )}
                <p><strong>Nakış/Baskı:</strong> {nakisBaskiMetni(seciliSiparis.nakisBaskiDurumu)}</p>
                <p><strong>Toplam Ürün:</strong> {seciliSiparis.toplamUrun} adet</p>
              </div>

              {/* Ürün Görseli */}
              <div className="detay-grup">
                <h3>Ürün Görseli</h3>
                <div className="modal-urun-gorsel">
                  {seciliSiparis.kombinasyonGorsel ? (
                    <div className="urun-gorsel-container">
                      <img src={seciliSiparis.kombinasyonGorsel} alt="Ürün Görseli" />
                      <div className="gorsel-bilgi">
                        <p><strong>Kombinasyon:</strong> {
                          seciliSiparis.siparisTuru === '3iplik' 
                            ? `${siparisTuruMetni(seciliSiparis.siparisTuru)} ${seciliSiparis.renkIsmi} ${ucIplikModeliMetni(seciliSiparis.ucIplikModeli)}`
                            : seciliSiparis.siparisTuru === 'polar' 
                              ? `${siparisTuruMetni(seciliSiparis.siparisTuru)} ${seciliSiparis.renkIsmi} ${polarModeliMetni(seciliSiparis.polarModeli)}`
                              : `${siparisTuruMetni(seciliSiparis.siparisTuru)} - ${seciliSiparis.renkIsmi} - ${kolTuruMetni(seciliSiparis.kolTuru)} - ${yakaTuruMetni(seciliSiparis.yakaTuru)}`
                        }</p>
                      </div>
                    </div>
                  ) : (
                    <div className="gorsel-yok">
                      <span>📷</span>
                      <p>Bu kombinasyon için görsel bulunamadı</p>
                      <div className="kombinasyon-bilgi">
                        <p><strong>Kombinasyon:</strong> {
                          seciliSiparis.siparisTuru === '3iplik' 
                            ? `${siparisTuruMetni(seciliSiparis.siparisTuru)} ${seciliSiparis.renkIsmi} ${ucIplikModeliMetni(seciliSiparis.ucIplikModeli)}`
                            : seciliSiparis.siparisTuru === 'polar' 
                              ? `${siparisTuruMetni(seciliSiparis.siparisTuru)} ${seciliSiparis.renkIsmi} ${polarModeliMetni(seciliSiparis.polarModeli)}`
                              : `${siparisTuruMetni(seciliSiparis.siparisTuru)} - ${seciliSiparis.renkIsmi} - ${kolTuruMetni(seciliSiparis.kolTuru)} - ${yakaTuruMetni(seciliSiparis.yakaTuru)}`
                        }</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="detay-grup">
                <h3>Beden Tablosu</h3>
                <div className="beden-tablosu">
                  {Object.entries(seciliSiparis.bedenTablosu).map(([beden, adet]) => (
                    adet > 0 && (
                      <div key={beden} className="beden-item">
                        <span className="beden">{beden}:</span>
                        <span className="adet">{adet} adet</span>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {seciliSiparis.not && (
                <div className="detay-grup">
                  <h3>Notlar</h3>
                  <div className="notlar-metni">{seciliSiparis.not}</div>
                </div>
              )}

              <div className="modal-actions">
                <button
                  className="modal-yazdir-btn"
                  onClick={() => handleYazdir(seciliSiparis)}
                >
                  🖨️ Yazdır
                </button>
                <button
                  className="modal-tamamla-btn"
                  onClick={() => handleModalTamamla(seciliSiparis.id)}
                >
                  ✓ Siparişi Tamamla
                </button>
                <button
                  className="modal-iptal-btn"
                  onClick={() => handleModalIptal(seciliSiparis.id)}
                >
                  ✗ Siparişi İptal Et
                </button>
                <button
                  className="siparis-sil-btn"
                  onClick={() => handleModalSil(seciliSiparis)}
                >
                  🗑️ Siparişi Sil
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