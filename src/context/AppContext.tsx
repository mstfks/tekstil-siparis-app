import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Musteri, Renk, Siparis, UrunKombinasyonu } from '../types';
import { musteriAPI, renkAPI, siparisAPI, kombinasyonAPI } from '../services/api';

interface AppContextType {
  musteriler: Musteri[];
  renkler: Renk[];
  siparisler: Siparis[];
  urunKombinasyonlari: UrunKombinasyonu[];
  siparisNoSayaci: number;
  musteriEkle: (musteri: Omit<Musteri, 'id' | 'sira'>) => Promise<void>;
  renkEkle: (renk: Omit<Renk, 'id' | 'sira'>) => Promise<void>;
  siparisEkle: (siparis: Omit<Siparis, 'id' | 'siparisNo' | 'tarih' | 'durum' | 'toplamUrun' | 'kombinasyonGorsel'>) => Promise<void>;
  musteriSil: (id: string) => Promise<void>;
  musteriSirala: (musteriId: string, yeniSira: number) => void;
  renkSil: (id: string) => Promise<void>;
  renkSirala: (renkId: string, yeniSira: number) => void;
  siparisTamamla: (id: string) => Promise<void>;
  siparisIptal: (id: string) => Promise<void>;
  siparisAktifeDonustur: (id: string) => Promise<void>;
  // Kombinasyon yönetimi
  kombinasyonEkle: (kombinasyon: Omit<UrunKombinasyonu, 'id'>, file: File) => Promise<void>;
  kombinasyonSil: (id: string) => Promise<void>;
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
  const [musteriler, setMusteriler] = useState<Musteri[]>([]);
  const [renkler, setRenkler] = useState<Renk[]>([]);
  const [siparisler, setSiparisler] = useState<Siparis[]>([]);
  const [siparisNoSayaci, setSiparisNoSayaci] = useState(1);
  const [urunKombinasyonlari, setUrunKombinasyonlari] = useState<UrunKombinasyonu[]>([]);

  // API'den verileri yükle
  const verileriYukle = async () => {
    try {
      const [musterilerData, renklerData, siparislerData, kombinasyonlarData] = await Promise.all([
        musteriAPI.getAll(),
        renkAPI.getAll(),
        siparisAPI.getAll(),
        kombinasyonAPI.getAll()
      ]);

      setMusteriler(musterilerData.map((m: any) => ({ ...m, id: m._id || m.id })));
      setRenkler(renklerData.map((r: any) => ({ ...r, id: r._id || r.id })));
      setSiparisler(siparislerData.map((s: any) => ({ 
        ...s, 
        id: s._id || s.id,
        tarih: new Date(s.createdAt || s.tarih)
      })));
      setUrunKombinasyonlari(kombinasyonlarData.map((k: any) => ({ ...k, id: k._id || k.id })));
      
      // En yüksek sipariş numarasını bul
      if (siparislerData.length > 0) {
        const maxSiparisNo = Math.max(...siparislerData.map((s: any) => s.siparisNo || 0));
        setSiparisNoSayaci(maxSiparisNo + 1);
      }
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
    }
  };

  useEffect(() => {
    verileriYukle();
  }, []);

  const musteriEkle = async (musteri: Omit<Musteri, 'id' | 'sira'>) => {
    try {
      const yeniMusteri = await musteriAPI.create(musteri);
      setMusteriler(prev => [...prev, { ...yeniMusteri, id: (yeniMusteri as any)._id || yeniMusteri.id }].sort((a, b) => a.sira - b.sira));
    } catch (error) {
      console.error('Müşteri eklenirken hata:', error);
      alert('Müşteri eklenirken bir hata oluştu.');
    }
  };

  const renkEkle = async (renk: Omit<Renk, 'id' | 'sira'>) => {
    try {
      const yeniRenk = await renkAPI.create(renk);
      setRenkler(prev => [...prev, { ...yeniRenk, id: (yeniRenk as any)._id || yeniRenk.id }].sort((a, b) => a.sira - b.sira));
    } catch (error) {
      console.error('Renk eklenirken hata:', error);
      alert('Renk eklenirken bir hata oluştu.');
    }
  };

  const siparisEkle = async (siparis: Omit<Siparis, 'id' | 'siparisNo' | 'tarih' | 'durum' | 'toplamUrun' | 'kombinasyonGorsel'>) => {
    try {
      const kombinasyon = kombinasyonBul(siparis.siparisTuru, siparis.renkId, siparis.kolTuru, siparis.yakaTuru);
      
      const siparisData = {
        ...siparis,
        kombinasyonGorsel: kombinasyon?.gorsel,
      };
      
      const yeniSiparis = await siparisAPI.create(siparisData);
      setSiparisler(prev => [...prev, { 
        ...yeniSiparis, 
        id: (yeniSiparis as any)._id || yeniSiparis.id,
        tarih: new Date((yeniSiparis as any).createdAt || yeniSiparis.tarih)
      }]);
      setSiparisNoSayaci(prev => prev + 1);
    } catch (error) {
      console.error('Sipariş eklenirken hata:', error);
      alert('Sipariş eklenirken bir hata oluştu.');
    }
  };

  const musteriSil = async (id: string) => {
    try {
      await musteriAPI.delete(id);
      setMusteriler(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Müşteri silinirken hata:', error);
      alert('Müşteri silinirken bir hata oluştu.');
    }
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

  const renkSil = async (id: string) => {
    try {
      await renkAPI.delete(id);
      setRenkler(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Renk silinirken hata:', error);
      alert('Renk silinirken bir hata oluştu.');
    }
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

  const siparisTamamla = async (id: string) => {
    try {
      await siparisAPI.updateStatus(id, 'tamamlandi');
      setSiparisler(prev => 
        prev.map(siparis => 
          siparis.id === id 
            ? { ...siparis, durum: 'tamamlandi' as const }
            : siparis
        )
      );
    } catch (error) {
      console.error('Sipariş tamamlanırken hata:', error);
      alert('Sipariş tamamlanırken bir hata oluştu.');
    }
  };

  const siparisIptal = async (id: string) => {
    try {
      await siparisAPI.updateStatus(id, 'iptal');
      setSiparisler(prev => 
        prev.map(siparis => 
          siparis.id === id 
            ? { ...siparis, durum: 'iptal' as const }
            : siparis
        )
      );
    } catch (error) {
      console.error('Sipariş iptal edilirken hata:', error);
      alert('Sipariş iptal edilirken bir hata oluştu.');
    }
  };

  const siparisAktifeDonustur = async (id: string) => {
    try {
      await siparisAPI.updateStatus(id, 'beklemede');
      setSiparisler(prev => 
        prev.map(siparis => 
          siparis.id === id 
            ? { ...siparis, durum: 'beklemede' as const }
            : siparis
        )
      );
    } catch (error) {
      console.error('Sipariş aktif edilirken hata:', error);
      alert('Sipariş aktif edilirken bir hata oluştu.');
    }
  };

  // Kombinasyon yönetimi fonksiyonları
  const kombinasyonEkle = async (kombinasyon: Omit<UrunKombinasyonu, 'id'>, file: File) => {
    try {
      const yeniKombinasyon = await kombinasyonAPI.create(kombinasyon, file);
      setUrunKombinasyonlari(prev => {
        // Aynı kombinasyon varsa güncelle
        const mevcutIndex = prev.findIndex(k => {
          const kombinasyonRenkId = typeof k.renkId === 'object' && (k.renkId as any)?.id ? (k.renkId as any).id : k.renkId;
          return k.siparisTuru === kombinasyon.siparisTuru &&
            kombinasyonRenkId === kombinasyon.renkId &&
            k.kolTuru === kombinasyon.kolTuru &&
            k.yakaTuru === kombinasyon.yakaTuru;
        });
        
        const yeniKombinasyonWithId = { ...yeniKombinasyon, id: (yeniKombinasyon as any)._id || yeniKombinasyon.id };
        
        if (mevcutIndex >= 0) {
          const yeni = [...prev];
          yeni[mevcutIndex] = yeniKombinasyonWithId;
          return yeni;
        }
        return [...prev, yeniKombinasyonWithId];
      });
    } catch (error) {
      console.error('Kombinasyon eklenirken hata:', error);
      alert('Kombinasyon eklenirken bir hata oluştu.');
    }
  };

  const kombinasyonSil = async (id: string) => {
    try {
      await kombinasyonAPI.delete(id);
      setUrunKombinasyonlari(prev => prev.filter(k => k.id !== id));
    } catch (error) {
      console.error('Kombinasyon silinirken hata:', error);
      alert('Kombinasyon silinirken bir hata oluştu.');
    }
  };

  const kombinasyonBul = (siparisTuru: string, renkId: string, kolTuru: string, yakaTuru: string) => {
    return urunKombinasyonlari.find(k => {
      // renkId karşılaştırması - hem string hem de populate edilmiş obje için
      const kombinasyonRenkId = typeof k.renkId === 'object' && (k.renkId as any)?.id ? (k.renkId as any).id : k.renkId;
      
      // MongoDB ObjectId string formatı vs direkt string karşılaştırması
      const renkIdEslesir = kombinasyonRenkId === renkId || 
                           (typeof k.renkId === 'object' && (k.renkId as any)?._id === renkId) ||
                           (typeof k.renkId === 'string' && k.renkId.toString() === renkId.toString());
      
      return k.siparisTuru === siparisTuru &&
        renkIdEslesir &&
        k.kolTuru === kolTuru &&
        k.yakaTuru === yakaTuru;
    });
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