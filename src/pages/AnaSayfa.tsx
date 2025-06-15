import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Siparis } from '../types';

const AnaSayfa: React.FC = () => {
  const { siparisler, siparisTamamla, siparisIptal, renkler } = useAppContext();
  const [seciliSiparis, setSeciliSiparis] = useState<Siparis | null>(null);
  const [siralama, setSiralama] = useState<'yeni-eski' | 'eski-yeni'>('yeni-eski');
  const [aramaMetni, setAramaMetni] = useState<string>('');

  // Sadece beklemedeki siparişleri göster, filtrele ve sırala
  const beklemedekiSiparisler = siparisler
    .filter(siparis => siparis.durum === 'beklemede')
    .filter(siparis => 
      aramaMetni === '' || 
      siparis.musteriIsmi.toLowerCase().includes(aramaMetni.toLowerCase())
    )
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

  const handleTamamla = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bu siparişi tamamlandı olarak işaretlemek istediğinizden emin misiniz?')) {
      siparisTamamla(id);
    }
  };

  const handleIptal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) {
      siparisIptal(id);
    }
  };

  const handleModalTamamla = (id: string) => {
    if (window.confirm('Bu siparişi tamamlandı olarak işaretlemek istediğinizden emin misiniz?')) {
      siparisTamamla(id);
      modalKapat();
    }
  };

  const handleModalIptal = (id: string) => {
    if (window.confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) {
      siparisIptal(id);
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
            size: A5 landscape;
            margin: 15mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #333;
            background: white;
          }
          
          .yazdir-container {
            width: 100%;
            height: 100vh;
            padding: 5px 10px;
            display: flex;
            flex-direction: column;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 8px;
            margin-bottom: 10px;
          }
          
          .header-left {
            flex: 1;
          }
          
          .header-left h1 {
            color: #2c3e50;
            font-size: 22px;
            font-weight: bold;
            margin: 0 0 6px 0;
          }
          
          .urun-ozet {
            color: #495057;
            font-size: 14px;
            font-weight: 600;
            margin: 0;
          }
          
          .header-right {
            text-align: right;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          
          .tarih {
            font-size: 12px;
            color: #6c757d;
            font-weight: 500;
          }
          
          .siparis-no {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
            background: #e9ecef;
            padding: 4px 8px;
            border-radius: 4px;
          }
          
          .content {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-rows: auto auto auto;
            gap: 12px;
            grid-template-areas: 
              "urun-gorseli urun-ozellikleri urun-ozellikleri"
              "beden-tablosu beden-tablosu beden-tablosu"
              "notlar notlar notlar";
          }
          
          .urun-gorseli {
            grid-area: urun-gorseli;
          }
          
          .urun-ozellikleri {
            grid-area: urun-ozellikleri;
          }
          
          .beden-tablosu-container {
            grid-area: beden-tablosu;
          }
          
          .notlar-container {
            grid-area: notlar;
          }
          
          .bilgi-grup {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 8px;
            height: fit-content;
          }
          
          .bilgi-grup h3 {
            color: #2c3e50;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 6px;
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 3px;
          }
          
          .bilgi-satir {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          
          .bilgi-satir:last-child {
            margin-bottom: 0;
          }
          
          .etiket {
            font-weight: 600;
            color: #495057;
          }
          
          .deger {
            color: #6c757d;
            text-align: right;
          }
          
          .beden-tablosu {
            display: flex;
            flex-wrap: nowrap;
            gap: 4px;
            margin-top: 6px;
            justify-content: flex-start;
            overflow: hidden;
          }
          
          .beden-item {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 3px 12px;
            text-align: center;
            font-size: 9px;
            min-width: 40px;
            max-width: 80px;
            flex: 1 1 80px;
            white-space: nowrap;
            overflow: hidden;
          }
          
          .beden-item .beden {
            font-weight: bold;
            color: #2c3e50;
          }
          
          .beden-item .adet {
            color: #6c757d;
          }
          
          .gorsel-alan {
            background: transparent;
            border: none;
            border-radius: 0;
            padding: 0;
            text-align: center;
            min-height: 160px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .gorsel-alan img {
            max-width: 100%;
            max-height: 160px;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          .gorsel-yok {
            color: #adb5bd;
            font-style: italic;
          }
          

          
          .not-alani {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 8px;
            height: fit-content;
          }
          
          .not-alani h3 {
            color: #2c3e50;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 6px;
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 3px;
          }
          
          .not-alani p {
            color: #6c757d;
            font-size: 10px;
            line-height: 1.3;
            margin: 0;
          }
          
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .yazdir-container { height: auto; }
          }
        </style>
      </head>
      <body>
        <div class="yazdir-container">
          <div class="header">
            <div class="header-left">
              <h1>${siparis.musteriIsmi}</h1>
              <p class="urun-ozet">${yakaTuruMetni(siparis.yakaTuru)} ${kolTuruMetni(siparis.kolTuru)} ${siparis.renkIsmi} ${siparisTuruMetni(siparis.siparisTuru)}</p>
            </div>
            <div class="header-right">
              <div class="tarih">${siparis.tarih.toLocaleDateString('tr-TR')}</div>
              <div class="siparis-no">#${siparis.siparisNo}</div>
            </div>
          </div>
          
          <div class="content">
            <div class="urun-gorseli">
              <div class="gorsel-alan">
                ${siparis.kombinasyonGorsel ? 
                  `<img src="${siparis.kombinasyonGorsel}" alt="Ürün Görseli" />` : 
                  '<div class="gorsel-yok">Görsel bulunamadı</div>'
                }
              </div>
            </div>
            
            <div class="urun-ozellikleri">
              <div class="bilgi-grup">
                <h3>Ürün Özellikleri</h3>
                <div class="bilgi-satir">
                  <span class="etiket">Sipariş Türü:</span>
                  <span class="deger">${siparisTuruMetni(siparis.siparisTuru)}</span>
                </div>
                <div class="bilgi-satir">
                  <span class="etiket">Renk:</span>
                  <span class="deger">${siparis.renkIsmi}</span>
                </div>
                <div class="bilgi-satir">
                  <span class="etiket">Kol Türü:</span>
                  <span class="deger">${kolTuruMetni(siparis.kolTuru)}</span>
                </div>
                <div class="bilgi-satir">
                  <span class="etiket">Yaka Türü:</span>
                  <span class="deger">${yakaTuruMetni(siparis.yakaTuru)}</span>
                </div>
                <div class="bilgi-satir">
                  <span class="etiket">Nakış/Baskı:</span>
                  <span class="deger">${nakisBaskiMetni(siparis.nakisBaskiDurumu)}</span>
                </div>
                <div class="bilgi-satir">
                  <span class="etiket">Toplam Ürün:</span>
                  <span class="deger"><strong>${siparis.toplamUrun} adet</strong></span>
                </div>
              </div>
            </div>
            
            <div class="beden-tablosu-container">
              <div class="bilgi-grup">
                <h3>Beden Dağılımı</h3>
                <div class="beden-tablosu">
                  ${Object.entries(siparis.bedenTablosu)
                    .filter(([_, adet]) => adet > 0)
                    .map(([beden, adet]) => `
                      <div class="beden-item">
                        <div class="beden">${beden}</div>
                        <div class="adet">${adet} adet</div>
                      </div>
                    `).join('')}
                </div>
              </div>
            </div>
            
            ${siparis.not ? `
              <div class="notlar-container">
                <div class="not-alani">
                  <h3>Notlar</h3>
                  <p>${siparis.not}</p>
                </div>
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
    document.body.appendChild(iframe);

    // İçeriği iframe'e yaz
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(yazdirmaIcerigi);
      iframeDoc.close();

      // Yazdırma işlemini başlat
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      // İframe'i temizle
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }
  };

  const kolTuruMetni = (kol: string) => {
    switch (kol) {
      case 'kisa': return 'Kısa Kol';
      case 'uzun': return 'Uzun Kol';
      case 'yetim': return 'Yetim Kol';
      case 'kisa-ribanali': return 'Kısa Ribanalı';
      default: return kol;
    }
  };

  const yakaTuruMetni = (yaka: string) => {
    switch (yaka) {
      case 'bisiklet': return 'Bisiklet Yaka';
      case 'v': return 'V Yaka';
      case 'polo': return 'Polo Yaka';
      default: return yaka;
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
      default: return tur;
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
                placeholder="Müşteri ismi ara..."
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
              {siralama === 'yeni-eski' ? '📅 ↓' : '📅 ↑'}
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
                  <p>{siparis.toplamUrun} adet {yakaTuruMetni(siparis.yakaTuru)} {kolTuruMetni(siparis.kolTuru)} {siparis.renkIsmi} {siparisTuruMetni(siparis.siparisTuru)}</p>
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
                <p><strong>Kol Türü:</strong> {kolTuruMetni(seciliSiparis.kolTuru)}</p>
                <p><strong>Yaka Türü:</strong> {yakaTuruMetni(seciliSiparis.yakaTuru)}</p>
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
                        <p><strong>Kombinasyon:</strong> {siparisTuruMetni(seciliSiparis.siparisTuru)} - {seciliSiparis.renkIsmi} - {kolTuruMetni(seciliSiparis.kolTuru)} - {yakaTuruMetni(seciliSiparis.yakaTuru)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="gorsel-yok">
                      <span>📷</span>
                      <p>Bu kombinasyon için görsel bulunamadı</p>
                      <div className="kombinasyon-bilgi">
                        <p><strong>Kombinasyon:</strong> {siparisTuruMetni(seciliSiparis.siparisTuru)} - {seciliSiparis.renkIsmi} - {kolTuruMetni(seciliSiparis.kolTuru)} - {yakaTuruMetni(seciliSiparis.yakaTuru)}</p>
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
                  <p>{seciliSiparis.not}</p>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnaSayfa; 