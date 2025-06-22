import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Siparis, KolTuru, YakaTuru, UcIplikModeli, PolarModeli } from '../types';

const GecmisSiparisler: React.FC = () => {
  const { siparisler, siparisAktifeDonustur, siparisSil } = useAppContext();
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
            text-align: center;
            min-height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .urun-gorseli img {
            max-width: 100%;
            max-height: 100px;
            object-fit: contain;
          }
          
          .gorsel-placeholder {
            color: #999;
            font-size: 13px;
            text-align: center;
          }
          
          .urun-ozellikleri {
            grid-area: urun-ozellikleri;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            align-content: start;
          }
          
          .ozellik {
            background: #f8f9fa;
            padding: 6px;
            border-radius: 3px;
            font-size: 13px;
          }
          
          .ozellik .label {
            font-weight: bold;
            color: #495057;
            margin-bottom: 2px;
          }
          
          .ozellik .value {
            color: #333;
          }
          
          .beden-tablosu-container {
            grid-area: beden-tablosu;
          }
          
          .beden-tablosu-container h3 {
            font-size: 15px;
            margin-bottom: 6px;
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 3px;
          }
          
          .beden-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
            gap: 4px;
          }
          
          .beden-item {
            background: #e9ecef;
            padding: 4px 6px;
            border-radius: 3px;
            text-align: center;
            font-size: 13px;
          }
          
          .beden-item .beden {
            font-weight: bold;
            color: #495057;
            font-size: 16px;
          }
          
          .beden-item .adet {
            color: #333;
            font-size: 16px;
            font-weight: bold;
          }
          
          .notlar-container {
            grid-area: notlar;
          }
          
          .notlar-container h3 {
            font-size: 15px;
            margin-bottom: 6px;
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 3px;
          }
          
          .notlar-metni {
            background: #f8f9fa;
            padding: 8px;
            border-radius: 3px;
            font-size: 13px;
            line-height: 1.4;
            color: #333;
            word-wrap: break-word;
          }
          
          .toplam-urun {
            margin-top: 8px;
            padding: 6px;
            background: #007bff;
            color: white;
            border-radius: 3px;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
          }
          
          @media print {
            .yazdir-container {
              padding: 8px;
            }
            
            .header h1 {
              font-size: 18px;
            }
            
            .header-right .siparis-no {
              font-size: 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="yazdir-container">
          <div class="header">
            <div class="header-left">
              <h1>${siparis.musteriIsmi}</h1>
              <div class="urun-ozet">
                ${siparis.toplamUrun} adet ${siparis.siparisTuru === '3iplik' ? `${siparisTuruMetni(siparis.siparisTuru)} ${siparis.renkIsmi} ${ucIplikModeliMetni(siparis.ucIplikModeli)}` : `${yakaTuruMetni(siparis.yakaTuru)} ${kolTuruMetni(siparis.kolTuru)} ${siparis.renkIsmi} ${siparisTuruMetni(siparis.siparisTuru)}`}
              </div>
            </div>
            <div class="header-right">
              <div class="tarih">${siparis.tarih.toLocaleDateString('tr-TR')}</div>
              <div class="siparis-no">#${siparis.siparisNo}</div>
            </div>
          </div>
          
          <div class="content">
            <div class="urun-gorseli">
              ${siparis.kombinasyonGorsel 
                ? `<img src="${siparis.kombinasyonGorsel}" alt="Ürün görseli" />` 
                : '<div class="gorsel-placeholder">Görsel yok</div>'
              }
            </div>
            
            <div class="urun-ozellikleri">
              <div class="ozellik">
                <div class="label">Sipariş Türü:</div>
                <div class="value">${siparisTuruMetni(siparis.siparisTuru)}</div>
              </div>
              <div class="ozellik">
                <div class="label">Renk:</div>
                <div class="value">${siparis.renkIsmi}</div>
              </div>
              ${siparis.siparisTuru === '3iplik' ? `
                <div class="ozellik">
                  <div class="label">Model:</div>
                  <div class="value">${ucIplikModeliMetni(siparis.ucIplikModeli)}</div>
                </div>
              ` : siparis.siparisTuru === 'polar' ? `
                <div class="ozellik">
                  <div class="label">Model:</div>
                  <div class="value">${siparis.polarModeli ? polarModeliMetni(siparis.polarModeli) : 'Belirtilmemiş'}</div>
                </div>
              ` : `
                <div class="ozellik">
                  <div class="label">Kol Türü:</div>
                  <div class="value">${kolTuruMetni(siparis.kolTuru)}</div>
                </div>
                <div class="ozellik">
                  <div class="label">Yaka Türü:</div>
                  <div class="value">${yakaTuruMetni(siparis.yakaTuru)}</div>
                </div>
              `}
              <div class="ozellik">
                <div class="label">Nakış/Baskı:</div>
                <div class="value">${nakisBaskiMetni(siparis.nakisBaskiDurumu)}</div>
              </div>
              <div class="ozellik">
                <div class="label">Durum:</div>
                <div class="value">${durumMetni(siparis.durum)}</div>
              </div>
            </div>
            
            <div class="beden-tablosu-container">
              <h3>Beden Dağılımı</h3>
              <div class="beden-grid">
                ${Object.entries(siparis.bedenTablosu)
                  .filter(([beden, adet]) => adet > 0)
                  .map(([beden, adet]) => `
                    <div class="beden-item">
                      <div class="beden">${beden}</div>
                      <div class="adet">${adet}</div>
                    </div>
                  `).join('')}
              </div>
              <div class="toplam-urun">
                Toplam: ${siparis.toplamUrun} Adet
              </div>
            </div>
            
            ${siparis.not ? `
              <div class="notlar-container">
                <h3>Notlar</h3>
                <div class="notlar-metni">${siparis.not}</div>
              </div>
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `;

    // Yeni pencere aç ve yazdır
    const yazdirmaPenceresi = window.open('', '_blank');
    if (yazdirmaPenceresi) {
      yazdirmaPenceresi.document.write(yazdirmaIcerigi);
      yazdirmaPenceresi.document.close();
      
      // Sayfa yüklenince yazdırma dialogunu aç
      yazdirmaPenceresi.onload = () => {
        yazdirmaPenceresi.focus();
        yazdirmaPenceresi.print();
      };
    }
  };

  const handleSiparisSil = async (siparis: Siparis) => {
    const confirmMessage = `Bu siparişi tamamen silmek istediğinizden emin misiniz?\n\nSipariş: #${siparis.siparisNo} - ${siparis.musteriIsmi}\nDurum: ${durumMetni(siparis.durum)}\n\nBu işlem geri alınamaz!`;
    
    if (window.confirm(confirmMessage)) {
      await siparisSil(siparis.id);
      modalKapat();
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
      case 'tamamlandi': return 'tamamlandi';
      case 'iptal': return 'iptal';
      default: return 'beklemede';
    }
  };

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
                            <span className={`durum-badge ${durumRengi(siparis.durum)}`}>{durumMetni(siparis.durum)}</span>
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
                  className="modal-yazdir-btn"
                  onClick={() => handleYazdir(seciliSiparis)}
                  title="Yazdır"
                >
                  🖨️ Yazdır
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
              </div>

              <div className="detay-grup">
                <h3>Ürün Bilgileri</h3>
                <p><strong>Renk:</strong> {seciliSiparis.renkIsmi}</p>
                {seciliSiparis.siparisTuru === '3iplik' ? (
                  <p><strong>Model:</strong> {ucIplikModeliMetni(seciliSiparis.ucIplikModeli)}</p>
                ) : seciliSiparis.siparisTuru === 'polar' ? (
                  <p><strong>Model:</strong> {seciliSiparis.polarModeli ? polarModeliMetni(seciliSiparis.polarModeli) : 'Belirtilmemiş'}</p>
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
                      <img 
                        src={seciliSiparis.kombinasyonGorsel} 
                        alt={`${seciliSiparis.renkIsmi} ${siparisTuruMetni(seciliSiparis.siparisTuru)}`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="gorsel-yok"><span>📷</span><p>Görsel mevcut değil</p></div>';
                          }
                        }}
                      />
                      <div className="gorsel-bilgi">
                        <p><strong>Kombinasyon:</strong> {seciliSiparis.renkIsmi} {siparisTuruMetni(seciliSiparis.siparisTuru)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="gorsel-yok">
                      <span>📷</span>
                      <p>Bu sipariş için görsel mevcut değil</p>
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
                {(seciliSiparis.durum === 'tamamlandi' || seciliSiparis.durum === 'iptal') && (
                  <button
                    className="geri-donustur-btn"
                    onClick={async () => {
                      if (window.confirm('Bu siparişi aktif siparişlere geri döndürmek istediğinizden emin misiniz?')) {
                        await siparisAktifeDonustur(seciliSiparis.id);
                        modalKapat();
                      }
                    }}
                  >
                    ↶ Aktif Siparişlere Geri Döndür
                  </button>
                )}
                
                <button
                  className="siparis-sil-btn"
                  onClick={() => handleSiparisSil(seciliSiparis)}
                >
                  Siparişi Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GecmisSiparisler; 