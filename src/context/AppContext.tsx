import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Musteri, Renk, Siparis, UrunKombinasyonu } from '../types';

interface AppContextType {
  musteriler: Musteri[];
  renkler: Renk[];
  siparisler: Siparis[];
  urunKombinasyonlari: UrunKombinasyonu[];
  siparisNoSayaci: number;
  musteriEkle: (musteri: Omit<Musteri, 'id' | 'sira'>) => void;
  renkEkle: (renk: Omit<Renk, 'id' | 'sira'>) => void;
  siparisEkle: (siparis: Omit<Siparis, 'id' | 'siparisNo' | 'tarih' | 'durum' | 'toplamUrun' | 'kombinasyonGorsel'>) => void;
  musteriSil: (id: string) => void;
  musteriSirala: (musteriId: string, yeniSira: number) => void;
  renkSil: (id: string) => void;
  renkSirala: (renkId: string, yeniSira: number) => void;
  siparisTamamla: (id: string) => void;
  siparisIptal: (id: string) => void;
  siparisAktifeDonustur: (id: string) => void;
  // Kombinasyon yönetimi
  kombinasyonEkle: (kombinasyon: Omit<UrunKombinasyonu, 'id'>) => void;
  kombinasyonSil: (id: string) => void;
  kombinasyonBul: (siparisTuru: string, renkId: string, kolTuru: string, yakaTuru: string) => UrunKombinasyonu | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [musteriler, setMusteriler] = useState<Musteri[]>([
    { id: '1', isim: 'Ahmet Yılmaz', sira: 1 },
    { id: '2', isim: 'Ayşe Kaya', sira: 2 },
    { id: '3', isim: 'Mehmet Demir', sira: 3 },
  ].sort((a, b) => a.sira - b.sira));

  const [renkler, setRenkler] = useState<Renk[]>([
    { id: '1', isim: 'Beyaz', kod: '#FFFFFF', sira: 1 },
    { id: '2', isim: 'Siyah', kod: '#000000', sira: 2 },
    { id: '3', isim: 'Kırmızı', kod: '#FF0000', sira: 3 },
    { id: '4', isim: 'Mavi', kod: '#0000FF', sira: 4 },
    { id: '5', isim: 'Yeşil', kod: '#00FF00', sira: 5 },
  ].sort((a, b) => a.sira - b.sira));

  const [siparisler, setSiparisler] = useState<Siparis[]>([]);
  const [siparisNoSayaci, setSiparisNoSayaci] = useState(1);

  // Ürün kombinasyonları
  const [urunKombinasyonlari, setUrunKombinasyonlari] = useState<UrunKombinasyonu[]>([]);

  const musteriEkle = (musteri: Omit<Musteri, 'id' | 'sira'>) => {
    const yeniSira = Math.max(...musteriler.map(m => m.sira), 0) + 1;
    const yeniMusteri: Musteri = {
      ...musteri,
      id: Date.now().toString(),
      sira: yeniSira,
    };
    setMusteriler(prev => [...prev, yeniMusteri].sort((a, b) => a.sira - b.sira));
  };

  const renkEkle = (renk: Omit<Renk, 'id' | 'sira'>) => {
    const yeniSira = Math.max(...renkler.map(r => r.sira), 0) + 1;
    const yeniRenk: Renk = {
      ...renk,
      id: Date.now().toString(),
      sira: yeniSira,
    };
    setRenkler(prev => [...prev, yeniRenk].sort((a, b) => a.sira - b.sira));
  };

  const siparisEkle = (siparis: Omit<Siparis, 'id' | 'siparisNo' | 'tarih' | 'durum' | 'toplamUrun' | 'kombinasyonGorsel'>) => {
    const toplamUrun = Object.values(siparis.bedenTablosu).reduce((toplam, adet) => toplam + adet, 0);
    
    // Kombinasyon görselini bul
    const kombinasyon = kombinasyonBul(siparis.siparisTuru, siparis.renkId, siparis.kolTuru, siparis.yakaTuru);
    
    const yeniSiparis: Siparis = {
      ...siparis,
      id: Date.now().toString(),
      siparisNo: siparisNoSayaci,
      durum: 'beklemede',
      toplamUrun,
      tarih: new Date(),
      kombinasyonGorsel: kombinasyon?.gorsel,
    };
    setSiparisler(prev => [...prev, yeniSiparis]);
    setSiparisNoSayaci(prev => prev + 1);
  };

  const musteriSil = (id: string) => {
    setMusteriler(prev => prev.filter(m => m.id !== id));
  };

  const musteriSirala = (musteriId: string, yeniSira: number) => {
    setMusteriler(prev => {
      const musteriler = [...prev];
      const musteriIndex = musteriler.findIndex(m => m.id === musteriId);
      
      if (musteriIndex === -1) return prev;
      
      const musteri = musteriler[musteriIndex];
      const eskiSira = musteri.sira;
      
      // Diğer müşterilerin sıralarını güncelle
      musteriler.forEach(m => {
        if (m.id === musteriId) {
          m.sira = yeniSira;
        } else if (eskiSira < yeniSira && m.sira > eskiSira && m.sira <= yeniSira) {
          m.sira -= 1;
        } else if (eskiSira > yeniSira && m.sira >= yeniSira && m.sira < eskiSira) {
          m.sira += 1;
        }
      });
      
      return musteriler.sort((a, b) => a.sira - b.sira);
    });
  };

  const renkSil = (id: string) => {
    setRenkler(prev => prev.filter(r => r.id !== id));
  };

  const renkSirala = (renkId: string, yeniSira: number) => {
    setRenkler(prev => {
      const renkler = [...prev];
      const renkIndex = renkler.findIndex(r => r.id === renkId);
      
      if (renkIndex === -1) return prev;
      
      const renk = renkler[renkIndex];
      const eskiSira = renk.sira;
      
      // Diğer renklerin sıralarını güncelle
      renkler.forEach(r => {
        if (r.id === renkId) {
          r.sira = yeniSira;
        } else if (eskiSira < yeniSira && r.sira > eskiSira && r.sira <= yeniSira) {
          r.sira -= 1;
        } else if (eskiSira > yeniSira && r.sira >= yeniSira && r.sira < eskiSira) {
          r.sira += 1;
        }
      });
      
      return renkler.sort((a, b) => a.sira - b.sira);
    });
  };

  const siparisTamamla = (id: string) => {
    setSiparisler(prev => 
      prev.map(siparis => 
        siparis.id === id 
          ? { ...siparis, durum: 'tamamlandi' as const }
          : siparis
      )
    );
  };

  const siparisIptal = (id: string) => {
    setSiparisler(prev => 
      prev.map(siparis => 
        siparis.id === id 
          ? { ...siparis, durum: 'iptal' as const }
          : siparis
      )
    );
  };

  const siparisAktifeDonustur = (id: string) => {
    setSiparisler(prev => 
      prev.map(siparis => 
        siparis.id === id 
          ? { ...siparis, durum: 'beklemede' as const }
          : siparis
      )
    );
  };

  // Kombinasyon yönetimi fonksiyonları
  const kombinasyonEkle = (kombinasyon: Omit<UrunKombinasyonu, 'id'>) => {
    const yeniKombinasyon: UrunKombinasyonu = {
      ...kombinasyon,
      id: Date.now().toString(),
    };
    setUrunKombinasyonlari(prev => {
      // Aynı kombinasyon varsa güncelle
      const mevcutIndex = prev.findIndex(k => 
        k.siparisTuru === kombinasyon.siparisTuru &&
        k.renkId === kombinasyon.renkId &&
        k.kolTuru === kombinasyon.kolTuru &&
        k.yakaTuru === kombinasyon.yakaTuru
      );
      
      if (mevcutIndex >= 0) {
        const yeni = [...prev];
        yeni[mevcutIndex] = yeniKombinasyon;
        return yeni;
      }
      return [...prev, yeniKombinasyon];
    });
  };

  const kombinasyonSil = (id: string) => {
    setUrunKombinasyonlari(prev => prev.filter(k => k.id !== id));
  };

  const kombinasyonBul = (siparisTuru: string, renkId: string, kolTuru: string, yakaTuru: string) => {
    return urunKombinasyonlari.find(k => 
      k.siparisTuru === siparisTuru &&
      k.renkId === renkId &&
      k.kolTuru === kolTuru &&
      k.yakaTuru === yakaTuru
    );
  };

  const value: AppContextType = {
    musteriler,
    renkler,
    siparisler,
    urunKombinasyonlari,
    siparisNoSayaci,
    musteriEkle,
    renkEkle,
    siparisEkle,
    musteriSil,
    musteriSirala,
    renkSil,
    renkSirala,
    siparisTamamla,
    siparisIptal,
    siparisAktifeDonustur,
    kombinasyonEkle,
    kombinasyonSil,
    kombinasyonBul,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}; 