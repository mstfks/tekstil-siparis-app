import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Siparis, SiparisTuru } from '../types';
import styles from '../../styles/analyz.module.css';

interface MusteriDetayi {
  isim: string;
  toplamUrun: number;
  toplamSiparis: number;
  siparisTuruDagilimi: { [key in SiparisTuru]: number };
  sonSiparisTarihi: string;
}

interface AnalizVerisi {
  toplamSiparis: number;
  toplamUrun: number;
  siparisTuruDagilimi: { [key in SiparisTuru]: number };
  musteriDagilimi: { [key: string]: number };
  renkDagilimi: { [key: string]: number };
  aylikTrend: { 
    ay: string; 
    siparisAdet: number; 
    urunAdet: number;
    siparisTuruAdetleri: { [key in SiparisTuru]: number };
  }[];
  ortalamaSiparisUrunSayisi: number;
  musteriDetaylari: MusteriDetayi[];
}

const AnalyzSayfasi: React.FC = () => {
  const { siparisler } = useAppContext();
  const [seciliPeriyot, setSeciliPeriyot] = useState<'tumu' | 'bu-ay' | 'son-3-ay' | 'bu-yil'>('tumu');
  const [musteriSayfasi, setMusteriSayfasi] = useState(1);
  const musteriSayfaBasina = 10;

  // Tamamlanan siparişleri filtrele
  const tamamlananSiparisler = siparisler.filter(siparis => siparis.durum === 'tamamlandi');

  // Periyot filtrelemesi
  const filtreliSiparisler = useMemo(() => {
    const simdi = new Date();
    const buAy = simdi.getMonth();
    const buYil = simdi.getFullYear();
    
    return tamamlananSiparisler.filter(siparis => {
      const siparisTarihi = new Date(siparis.tarih);
      const siparisAy = siparisTarihi.getMonth();
      const siparisYil = siparisTarihi.getFullYear();
      
      switch (seciliPeriyot) {
        case 'bu-ay':
          return siparisAy === buAy && siparisYil === buYil;
        case 'son-3-ay':
          const ucAyOnce = new Date(simdi);
          ucAyOnce.setMonth(simdi.getMonth() - 3);
          return siparisTarihi >= ucAyOnce;
        case 'bu-yil':
          return siparisYil === buYil;
        default:
          return true;
      }
    });
  }, [tamamlananSiparisler, seciliPeriyot]);

  // Analiz verilerini hesapla
  const analizVerisi: AnalizVerisi = useMemo(() => {
    const toplamSiparis = filtreliSiparisler.length;
    const toplamUrun = filtreliSiparisler.reduce((toplam, siparis) => toplam + siparis.toplamUrun, 0);
    
    // Sipariş türü dağılımı (toplam ürün adetine göre)
    const siparisTuruDagilimi = filtreliSiparisler.reduce((acc, siparis) => {
      acc[siparis.siparisTuru] = (acc[siparis.siparisTuru] || 0) + siparis.toplamUrun;
      return acc;
    }, {} as { [key in SiparisTuru]: number });

    // Müşteri dağılımı (toplam ürün adetine göre)
    const musteriDagilimi = filtreliSiparisler.reduce((acc, siparis) => {
      acc[siparis.musteriIsmi] = (acc[siparis.musteriIsmi] || 0) + siparis.toplamUrun;
      return acc;
    }, {} as { [key: string]: number });

    // Renk dağılımı (toplam ürün adetine göre)
    const renkDagilimi = filtreliSiparisler.reduce((acc, siparis) => {
      acc[siparis.renkIsmi] = (acc[siparis.renkIsmi] || 0) + siparis.toplamUrun;
      return acc;
    }, {} as { [key: string]: number });

    // Aylık trend (son 12 ay)
    const aylikTrend: { 
      ay: string; 
      siparisAdet: number; 
      urunAdet: number;
      siparisTuruAdetleri: { [key in SiparisTuru]: number };
    }[] = [];
    const simdi = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const ay = new Date(simdi.getFullYear(), simdi.getMonth() - i, 1);
      const ayIsimleri = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
      ];
      
      const ayinSiparisleri = tamamlananSiparisler.filter(siparis => {
        const siparisTarihi = new Date(siparis.tarih);
        return siparisTarihi.getMonth() === ay.getMonth() && 
               siparisTarihi.getFullYear() === ay.getFullYear();
      });
      
      aylikTrend.push({
        ay: `${ayIsimleri[ay.getMonth()]} ${ay.getFullYear()}`,
        siparisAdet: ayinSiparisleri.length,
        urunAdet: ayinSiparisleri.reduce((toplam, siparis) => toplam + siparis.toplamUrun, 0),
        siparisTuruAdetleri: ayinSiparisleri.reduce((acc, siparis) => {
          acc[siparis.siparisTuru] = (acc[siparis.siparisTuru] || 0) + siparis.toplamUrun;
          return acc;
        }, {} as { [key in SiparisTuru]: number })
      });
    }

    const ortalamaSiparisUrunSayisi = toplamSiparis > 0 ? Math.round((toplamUrun / toplamSiparis) * 10) / 10 : 0;

    // Müşteri detaylarını hesapla
    const musteriDetaylari: MusteriDetayi[] = Object.keys(musteriDagilimi).map(musteriIsmi => {
      const musteriSiparisleri = filtreliSiparisler.filter(siparis => siparis.musteriIsmi === musteriIsmi);
      const musteriSiparisTuruDagilimi = musteriSiparisleri.reduce((acc, siparis) => {
        acc[siparis.siparisTuru] = (acc[siparis.siparisTuru] || 0) + siparis.toplamUrun;
        return acc;
      }, {} as { [key in SiparisTuru]: number });

      const sonSiparis = musteriSiparisleri.sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime())[0];

      return {
        isim: musteriIsmi,
        toplamUrun: musteriDagilimi[musteriIsmi],
        toplamSiparis: musteriSiparisleri.length,
        siparisTuruDagilimi: musteriSiparisTuruDagilimi,
        sonSiparisTarihi: sonSiparis ? new Date(sonSiparis.tarih).toLocaleDateString('tr-TR') : '-'
      };
    }).sort((a, b) => b.toplamUrun - a.toplamUrun);

    return {
      toplamSiparis,
      toplamUrun,
      siparisTuruDagilimi,
      musteriDagilimi,
      renkDagilimi,
      aylikTrend,
      ortalamaSiparisUrunSayisi,
      musteriDetaylari
    };
  }, [filtreliSiparisler, tamamlananSiparisler]);

  // Yardımcı fonksiyonlar
  const siparisTuruMetni = (tur: SiparisTuru): string => {
    const metinler = {
      'suprem': 'Süprem',
      'lakost': 'Lakost',
      'yagmurdesen': 'Yağmur Desen',
      '3iplik': '3 İplik',
      'polar': 'Polar'
    };
    return metinler[tur] || tur;
  };

  const periyotMetni = (periyot: typeof seciliPeriyot): string => {
    const metinler = {
      'tumu': 'Tümü',
      'bu-ay': 'Bu Ay',
      'son-3-ay': 'Son 3 Ay',
      'bu-yil': 'Bu Yıl'
    };
    return metinler[periyot];
  };

  // Yüzde hesaplama
  const yuzdeHesapla = (deger: number, toplam: number): string => {
    return toplam > 0 ? `${Math.round((deger / toplam) * 100)}%` : '0%';
  };

  // En popüler renkler
  const enPopulerRenkler = Object.entries(analizVerisi.renkDagilimi)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Müşteri sayfalama hesaplamaları
  const toplamMusteriSayisi = analizVerisi.musteriDetaylari.length;
  const toplamSayfa = Math.ceil(toplamMusteriSayisi / musteriSayfaBasina);
  const baslangicIndex = (musteriSayfasi - 1) * musteriSayfaBasina;
  const bitisIndex = baslangicIndex + musteriSayfaBasina;
  const sayfadakiMusteriler = analizVerisi.musteriDetaylari.slice(baslangicIndex, bitisIndex);

  return (
    <div className={styles.analyzSayfasi}>
      {/* Modern Header */}
      <div className="modern-header">
        <div className="header-content">
          <div className="header-left">
            <div className="title-section">
              <h1 className="page-title">
                <span className="title-icon">📊</span>
                Sipariş Analizi
              </h1>
            </div>
            <p className="subtitle">Tamamlanan siparişlerinizin detaylı analizi</p>
          </div>
          
          <div className="header-right">
          </div>
        </div>
      </div>

      <div className={styles.sayfaHeader}>
        <div className={styles.periyotFiltreleri}>
          {(['tumu', 'bu-ay', 'son-3-ay', 'bu-yil'] as const).map(periyot => (
            <button
              key={periyot}
              className={`${styles.periyotBtn} ${seciliPeriyot === periyot ? styles.aktif : ''}`}
              onClick={() => setSeciliPeriyot(periyot)}
            >
              {periyotMetni(periyot)}
            </button>
          ))}
        </div>
      </div>

      {filtreliSiparisler.length === 0 ? (
        <div className={styles.bosDurum}>
          <p>Seçili periyot için tamamlanmış sipariş bulunamadı.</p>
        </div>
      ) : (
        <div className={styles.analyzIcerik}>
          {/* Genel İstatistikler */}
          <div className={styles.istatistikKartlari}>
            <div className={styles.istatistikKarti}>
              <div className={styles.kartIkon}>📋</div>
              <div className={styles.kartIcerik}>
                <h3>Toplam Sipariş</h3>
                <p className={styles.buyukSayi}>{analizVerisi.toplamSiparis}</p>
              </div>
            </div>
            
            <div className={styles.istatistikKarti}>
              <div className={styles.kartIkon}>👕</div>
              <div className={styles.kartIcerik}>
                <h3>Toplam Ürün</h3>
                <p className={styles.buyukSayi}>{analizVerisi.toplamUrun}</p>
              </div>
            </div>
            
            <div className={styles.istatistikKarti}>
              <div className={styles.kartIkon}>📈</div>
              <div className={styles.kartIcerik}>
                <h3>Ortalama Sipariş Büyüklüğü</h3>
                <p className={styles.buyukSayi}>{analizVerisi.ortalamaSiparisUrunSayisi}</p>
                <span className={styles.kucukMetin}>ürün/sipariş</span>
              </div>
            </div>
          </div>

          {/* Sipariş Türü İstatistikleri */}
          <div className={styles.istatistikKartlari}>
            <div className={styles.istatistikKarti} style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <div className={styles.kartIkon}>🏷️</div>
              <div className={styles.kartIcerik}>
                <h3>Süprem</h3>
                <p className={styles.buyukSayi}>{analizVerisi.siparisTuruDagilimi.suprem || 0}</p>
                <span className={styles.kucukMetin}>ürün</span>
              </div>
            </div>
            
            <div className={styles.istatistikKarti} style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
              <div className={styles.kartIkon}>🏷️</div>
              <div className={styles.kartIcerik}>
                <h3>Lakost</h3>
                <p className={styles.buyukSayi}>{analizVerisi.siparisTuruDagilimi.lakost || 0}</p>
                <span className={styles.kucukMetin}>ürün</span>
              </div>
            </div>
            
            <div className={styles.istatistikKarti} style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
              <div className={styles.kartIkon}>🏷️</div>
              <div className={styles.kartIcerik}>
                <h3>Yağmur Desen</h3>
                <p className={styles.buyukSayi}>{analizVerisi.siparisTuruDagilimi.yagmurdesen || 0}</p>
                <span className={styles.kucukMetin}>ürün</span>
              </div>
            </div>

            <div className={styles.istatistikKarti} style={{background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}>
              <div className={styles.kartIkon}>🏷️</div>
              <div className={styles.kartIcerik}>
                <h3>3 İplik</h3>
                <p className={styles.buyukSayi}>{analizVerisi.siparisTuruDagilimi['3iplik'] || 0}</p>
                <span className={styles.kucukMetin}>ürün</span>
              </div>
            </div>

            <div className={styles.istatistikKarti} style={{background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'}}>
              <div className={styles.kartIkon}>🏷️</div>
              <div className={styles.kartIcerik}>
                <h3>Polar</h3>
                <p className={styles.buyukSayi}>{analizVerisi.siparisTuruDagilimi.polar || 0}</p>
                <span className={styles.kucukMetin}>ürün</span>
              </div>
            </div>
          </div>

          {/* Ürün Türü Dağılımı */}
          <div className={styles.analyzBolumu}>
            <h2>🎯 Ürün Türü Dağılımı</h2>
            <div className={styles.dagilimListesi}>
              {Object.entries(analizVerisi.siparisTuruDagilimi).map(([tur, adet]) => (
                <div key={tur} className={styles.dagilimSatiri}>
                  <span className={styles.dagilimEtiket}>{siparisTuruMetni(tur as SiparisTuru)}</span>
                  <div className={styles.dagilimBar}>
                    <div 
                      className={styles.dagilimDolgu} 
                      style={{ width: yuzdeHesapla(adet, analizVerisi.toplamUrun) }}
                    ></div>
                  </div>
                  <span className={styles.dagilimDeger}>{adet} ürün ({yuzdeHesapla(adet, analizVerisi.toplamUrun)})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detaylı Müşteri Analizi */}
          <div className={styles.analyzBolumu}>
            <div className={styles.musteriHeader}>
              <h2>👥 Detaylı Müşteri Analizi</h2>
              <div className={styles.sayfalamaBilgi}>
                <span>Toplam {toplamMusteriSayisi} müşteri</span>
                <span>Sayfa {musteriSayfasi} / {toplamSayfa}</span>
              </div>
            </div>
            
            <div className={styles.musteriTablosu}>
              <div className={styles.musteriTabloBasi}>
                <span>Müşteri Adı</span>
                <span>Toplam Ürün</span>
                <span>Süprem</span>
                <span>Lakost</span>
                <span>Yağmur Desen</span>
                <span>3 İplik</span>
                <span>Polar</span>
              </div>
              
              {sayfadakiMusteriler.map((musteri, index) => (
                <div key={musteri.isim} className={styles.musteriTabloSatiri}>
                  <span className={styles.musteriIsim}>
                    <span className={styles.musteriSiraNo}>{baslangicIndex + index + 1}</span>
                    {musteri.isim}
                  </span>
                  <span className={styles.musteriAdet}>{musteri.toplamUrun}</span>
                  <span className={styles.musteriTur}>{musteri.siparisTuruDagilimi.suprem || 0}</span>
                  <span className={styles.musteriTur}>{musteri.siparisTuruDagilimi.lakost || 0}</span>
                  <span className={styles.musteriTur}>{musteri.siparisTuruDagilimi.yagmurdesen || 0}</span>
                  <span className={styles.musteriTur}>{musteri.siparisTuruDagilimi['3iplik'] || 0}</span>
                  <span className={styles.musteriTur}>{musteri.siparisTuruDagilimi.polar || 0}</span>
                </div>
              ))}
            </div>

            {toplamSayfa > 1 && (
              <div className={styles.sayfalama}>
                <button 
                  className={styles.sayfalamaBtn}
                  disabled={musteriSayfasi === 1}
                  onClick={() => setMusteriSayfasi(1)}
                >
                  «
                </button>
                <button 
                  className={styles.sayfalamaBtn}
                  disabled={musteriSayfasi === 1}
                  onClick={() => setMusteriSayfasi(musteriSayfasi - 1)}
                >
                  ‹
                </button>
                
                {Array.from({ length: Math.min(5, toplamSayfa) }, (_, i) => {
                  const sayfaNo = Math.max(1, Math.min(toplamSayfa - 4, musteriSayfasi - 2)) + i;
                  return sayfaNo <= toplamSayfa ? (
                    <button
                      key={sayfaNo}
                      className={`${styles.sayfalamaBtn} ${musteriSayfasi === sayfaNo ? styles.aktifSayfa : ''}`}
                      onClick={() => setMusteriSayfasi(sayfaNo)}
                    >
                      {sayfaNo}
                    </button>
                  ) : null;
                })}
                
                <button 
                  className={styles.sayfalamaBtn}
                  disabled={musteriSayfasi === toplamSayfa}
                  onClick={() => setMusteriSayfasi(musteriSayfasi + 1)}
                >
                  ›
                </button>
                <button 
                  className={styles.sayfalamaBtn}
                  disabled={musteriSayfasi === toplamSayfa}
                  onClick={() => setMusteriSayfasi(toplamSayfa)}
                >
                  »
                </button>
              </div>
            )}
          </div>

          {/* En Popüler Renkler */}
          <div className={styles.analyzBolumu}>
            <h2>🎨 En Popüler Renkler (Top 5)</h2>
            <div className={styles.populerListe}>
              {enPopulerRenkler.map(([renk, adet], index) => (
                <div key={renk} className={styles.populerSatir}>
                  <span className={styles.siraNo}>{index + 1}</span>
                  <span className={styles.populerIsim}>{renk}</span>
                  <span className={styles.populerAdet}>{adet} ürün</span>
                </div>
              ))}
            </div>
          </div>

          {/* Aylık Trend */}
          <div className={styles.analyzBolumu}>
            <h2>📈 Aylık Trend (Son 12 Ay)</h2>
            <div className={styles.trendGrafik}>
              <div className={styles.trendHeader}>
                <span>Ay</span>
                <span>Sipariş</span>
                <span>Ürün</span>
                <span>Süprem</span>
                <span>Lakost</span>
                <span>Yağmur Desen</span>
                <span>3 İplik</span>
                <span>Polar</span>
              </div>
              {analizVerisi.aylikTrend.map((veri, index) => (
                <div key={index} className={styles.trendSatir}>
                  <span className={styles.trendAy}>{veri.ay}</span>
                  <span className={styles.trendSiparis}>{veri.siparisAdet}</span>
                  <span className={styles.trendUrun}>{veri.urunAdet}</span>
                  <span className={styles.trendTur}>{veri.siparisTuruAdetleri.suprem || 0}</span>
                  <span className={styles.trendTur}>{veri.siparisTuruAdetleri.lakost || 0}</span>
                  <span className={styles.trendTur}>{veri.siparisTuruAdetleri.yagmurdesen || 0}</span>
                  <span className={styles.trendTur}>{veri.siparisTuruAdetleri['3iplik'] || 0}</span>
                  <span className={styles.trendTur}>{veri.siparisTuruAdetleri.polar || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyzSayfasi; 