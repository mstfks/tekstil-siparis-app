import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Siparis } from '../types';

const GecmisSiparisler: React.FC = () => {
  const { siparisler, siparisAktifeDonustur } = useAppContext();
  const [seciliSiparis, setSeciliSiparis] = useState<Siparis | null>(null);
  const [filtre, setFiltre] = useState<'hepsi' | 'tamamlandi' | 'iptal'>('hepsi');
  const [aramaMetni, setAramaMetni] = useState<string>('');
  const [acikGruplar, setAcikGruplar] = useState<Set<string>>(new Set());
  const [ilkYukleme, setIlkYukleme] = useState<boolean>(true);

  // Geçmiş siparişleri filtrele (tamamlanan ve iptal edilen)
  const gecmisSiparisler = siparisler.filter(siparis => 
    siparis.durum === 'tamamlandi' || siparis.durum === 'iptal'
  );

  // Filtreye ve arama metnine göre siparişleri göster
  const filtreliSiparisler = gecmisSiparisler
    .filter(siparis => {
      if (filtre === 'hepsi') return true;
      return siparis.durum === filtre;
    })
    .filter(siparis => 
      aramaMetni === '' || 
      siparis.musteriIsmi.toLowerCase().includes(aramaMetni.toLowerCase())
    );

  // Siparişleri yıl ve ay gruplarına ayır
  const siparisGruplari = filtreliSiparisler.reduce((gruplar, siparis) => {
    const tarih = new Date(siparis.tarih);
    const yil = tarih.getFullYear();
    const ay = tarih.getMonth();
    
    const ayIsimleri = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    
    const grupAnahtari = `${yil}-${ay}`;
    const grupBasligi = `${ayIsimleri[ay]} ${yil}`;
    
    if (!gruplar[grupAnahtari]) {
      gruplar[grupAnahtari] = {
        baslik: grupBasligi,
        siparisler: [],
        yil,
        ay
      };
    }
    
    gruplar[grupAnahtari].siparisler.push(siparis);
    return gruplar;
  }, {} as { [key: string]: { baslik: string; siparisler: Siparis[]; yil: number; ay: number } });

  // Grupları tarihe göre sırala (en yeni en üstte)
  const siraliGruplar = Object.values(siparisGruplari).sort((a, b) => {
    if (a.yil !== b.yil) return b.yil - a.yil;
    return b.ay - a.ay;
  });

  // Her grup içindeki siparişleri de tarihe göre sırala (en yeni en üstte)
  siraliGruplar.forEach(grup => {
    grup.siparisler.sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());
  });

  // İlk render'da sadece en son ayı açık tut
  React.useEffect(() => {
    if (siraliGruplar.length > 0 && ilkYukleme) {
      const enSonGrup = siraliGruplar[0];
      const grupAnahtari = `${enSonGrup.yil}-${enSonGrup.ay}`;
      setAcikGruplar(new Set([grupAnahtari]));
      setIlkYukleme(false);
    }
  }, [siraliGruplar.length, ilkYukleme]);

  const grupToggle = (grupAnahtari: string) => {
    const yeniAcikGruplar = new Set(acikGruplar);
    if (yeniAcikGruplar.has(grupAnahtari)) {
      yeniAcikGruplar.delete(grupAnahtari);
    } else {
      yeniAcikGruplar.add(grupAnahtari);
    }
    setAcikGruplar(yeniAcikGruplar);
  };

  const siparisDetayiGoster = (siparis: Siparis) => {
    setSeciliSiparis(siparis);
  };

  const modalKapat = () => {
    setSeciliSiparis(null);
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
            font-size: 11px;
            line-height: 1.3;
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
            font-size: 12px;
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
            font-size: 10px;
            color: #666;
          }
          
          .header-right .siparis-no {
            font-size: 14px;
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
            font-size: 10px;
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
            font-size: 12px;
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
            font-size: 10px;
          }
          
          .ozellik-value {
            color: #333;
            font-size: 10px;
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
            font-size: 12px;
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
            font-size: clamp(10px, 2.2vw, 13px);
            display: block;
            margin-bottom: 3px;
            padding-bottom: 2px;
            border-bottom: 1px solid #ddd;
          }
          
          .beden-item .adet {
            color: #333;
            font-size: clamp(10px, 2.2vw, 13px);
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
            font-size: 12px;
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
            font-size: 10px;
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
              <p class="urun-ozet">${yakaTuruMetni(siparis.yakaTuru)} ${kolTuruMetni(siparis.kolTuru)} ${siparis.renkIsmi} ${siparisTuruMetni(siparis.siparisTuru)}</p>
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
                '<div class="gorsel-yok">Görsel bulunamadı</div>'
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
              <div class="ozellik-item">
                <span class="ozellik-label">Kol Türü:</span>
                <span class="ozellik-value">${kolTuruMetni(siparis.kolTuru)}</span>
              </div>
              <div class="ozellik-item">
                <span class="ozellik-label">Yaka Türü:</span>
                <span class="ozellik-value">${yakaTuruMetni(siparis.yakaTuru)}</span>
              </div>
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
                      <div class="adet">${adet} adet</div>
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

  const durumMetni = (durum: string) => {
    switch (durum) {
      case 'tamamlandi': return 'Tamamlandı';
      case 'iptal': return 'İptal Edildi';
      default: return durum;
    }
  };

  const durumRengi = (durum: string) => {
    switch (durum) {
      case 'tamamlandi': return 'durum-tamamlandi';
      case 'iptal': return 'durum-iptal';
      default: return '';
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
    <div className="gecmis-siparisler">
      <div className="sayfa-header">
        <div className="header-sol">
          <h1>Geçmiş Siparişler</h1>
        </div>
        <div className="header-sag">
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
          <div className="filtre-grup">
            <button
              className={`filtre-btn ${filtre === 'hepsi' ? 'aktif' : ''}`}
              onClick={() => setFiltre('hepsi')}
            >
              Hepsi ({gecmisSiparisler.length})
            </button>
            <button
              className={`filtre-btn ${filtre === 'tamamlandi' ? 'aktif' : ''}`}
              onClick={() => setFiltre('tamamlandi')}
            >
              Tamamlanan ({gecmisSiparisler.filter(s => s.durum === 'tamamlandi').length})
            </button>
            <button
              className={`filtre-btn ${filtre === 'iptal' ? 'aktif' : ''}`}
              onClick={() => setFiltre('iptal')}
            >
              İptal Edilen ({gecmisSiparisler.filter(s => s.durum === 'iptal').length})
            </button>
          </div>
        </div>
      </div>

      {filtreliSiparisler.length === 0 ? (
        <div className="bos-liste">
          <p>
            {aramaMetni ? (
              `"${aramaMetni}" araması için sonuç bulunamadı.`
            ) : filtre === 'hepsi' ? (
              'Henüz geçmiş sipariş bulunmuyor.'
            ) : (
              `Henüz ${filtre === 'tamamlandi' ? 'tamamlanan' : 'iptal edilen'} sipariş bulunmuyor.`
            )}
          </p>
        </div>
      ) : (
        <div className="siparis-gruplari">
          {siraliGruplar.map((grup) => {
            const grupAnahtari = `${grup.yil}-${grup.ay}`;
            const acik = acikGruplar.has(grupAnahtari);
            
            return (
              <div key={grupAnahtari} className="siparis-grup">
                <div 
                  className="grup-baslik"
                  onClick={() => grupToggle(grupAnahtari)}
                >
                  <div className="grup-baslik-sol">
                    <button className="daralt-btn">
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        className={`daralt-ikon ${acik ? 'acik' : ''}`}
                      >
                        <path 
                          d="M9 18L15 12L9 6" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <h2>{grup.baslik}</h2>
                  </div>
                  <span className="grup-sayisi">{grup.siparisler.length} sipariş</span>
                </div>
                {acik && (
                  <div className="siparis-listesi">
                    {grup.siparisler.map((siparis) => (
                      <div
                        key={siparis.id}
                        className="siparis-kart"
                        onClick={() => siparisDetayiGoster(siparis)}
                      >
                        <div className="siparis-bilgi">
                          <div className="siparis-baslik">
                            <h3>{siparis.musteriIsmi} #{siparis.siparisNo} - {siparis.tarih.toLocaleDateString('tr-TR')}</h3>
                            <span className={`durum-badge ${durumRengi(siparis.durum)}`}>
                              {durumMetni(siparis.durum)}
                            </span>
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {seciliSiparis && (
        <div className="modal-overlay" onClick={modalKapat}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                          <div className="modal-header">
                <h2>Sipariş Detayı #{seciliSiparis.siparisNo}</h2>
                <div className="header-actions">
                  <span className={`durum-badge ${durumRengi(seciliSiparis.durum)}`}>
                    {durumMetni(seciliSiparis.durum)}
                  </span>
                  <button 
                    className="yazdir-btn-header"
                    onClick={() => handleYazdir(seciliSiparis)}
                    title="Yazdır"
                  >
                    🖨️
                  </button>
                  <button className="kapat-btn" onClick={modalKapat}>×</button>
                </div>
              </div>
            <div className="modal-body">
              <div className="detay-grup">
                <h3>Müşteri Bilgileri</h3>
                <p><strong>Müşteri:</strong> {seciliSiparis.musteriIsmi}</p>
                <p><strong>Sipariş Tarihi:</strong> {seciliSiparis.tarih.toLocaleDateString('tr-TR')}</p>
                <p><strong>Sipariş Türü:</strong> {siparisTuruMetni(seciliSiparis.siparisTuru)}</p>
                <p><strong>Durum:</strong> {durumMetni(seciliSiparis.durum)}</p>
              </div>

              <div className="detay-grup">
                <h3>Ürün Bilgileri</h3>
                <p><strong>Renk:</strong> {seciliSiparis.renkIsmi}</p>
                <p><strong>Kol Türü:</strong> {kolTuruMetni(seciliSiparis.kolTuru)}</p>
                <p><strong>Yaka Türü:</strong> {yakaTuruMetni(seciliSiparis.yakaTuru)}</p>
                <p><strong>Nakış/Baskı:</strong> {nakisBaskiMetni(seciliSiparis.nakisBaskiDurumu)}</p>
                <p><strong>Toplam Ürün:</strong> {seciliSiparis.toplamUrun} adet</p>
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

              {seciliSiparis.durum === 'tamamlandi' && (
                <div className="detay-grup">
                  <button
                    className="geri-donustur-btn"
                    onClick={async () => {
                      if (window.confirm('Bu siparişi aktif siparişlere geri döndürmek istediğinizden emin misiniz?')) {
                        await siparisAktifeDonustur(seciliSiparis.id);
                        modalKapat();
                      }
                    }}
                  >
                    🔄 Aktif Siparişlere Geri Döndür
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GecmisSiparisler; 