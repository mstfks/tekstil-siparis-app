export interface Musteri {
  id: string;
  isim: string;
  sira: number;
}

export interface Renk {
  id: string;
  isim: string;
  kod: string;
  sira: number;
}

export type KolTuru = 'kisa' | 'uzun' | 'yetim' | 'kisa-ribanali';
export type YakaTuru = 'bisiklet' | 'v' | 'polo';
export type NakisBaskiDurumu = 'on' | 'on-arka' | 'on-1kol' | 'on-kollar' | 'arka' | 'arka-1kol' | 'arka-kollar' | '1kol' | 'kollar' | 'on-arka-kollar' | 'on-arka-1kol' | 'dikilecek' | 'sorulacak';
export type SiparisTuru = 'suprem' | 'lakost' | 'yagmurdesen' | '3iplik' | 'polar';
export type UcIplikModeli = 'dik-yaka-mont' | 'bisiklet-yaka-sivit' | 'kapusonlu-sivit' | 'kisa-fermuarli-sivit' | 'kapusonlu-mont' | 'polo-yaka-sivit';
export type PolarModeli = 'dik-yaka-mont' | 'kisa-fermuarli-sivit' | 'kapusonlu-mont' | 'sal-70cm' | 'sal-90cm';
export type SiparisDurumu = 'beklemede' | 'tamamlandi' | 'iptal';

export interface BedenTablosu {
  XXS: number;
  XS: number;
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
  '3XL': number;
  '4XL': number;
  [key: string]: number;
}

// Ürün kombinasyonu için görsel
export interface UrunKombinasyonu {
  id: string;
  siparisTuru: SiparisTuru;
  renkId: string;
  kolTuru?: KolTuru; // 3 İplik için opsiyonel
  yakaTuru?: YakaTuru; // 3 İplik için opsiyonel
  ucIplikModeli?: UcIplikModeli; // 3 İplik için model
  polarModeli?: PolarModeli; // Polar için model
  gorsel: string;
  isim: string; // Kolay tanımlama için
}

export interface Siparis {
  id: string;
  siparisNo: number;
  siparisTuru: SiparisTuru;
  durum: SiparisDurumu;
  musteriId: string;
  musteriIsmi: string;
  renkId: string;
  renkIsmi: string;
  kolTuru?: KolTuru; // 3 İplik için opsiyonel
  yakaTuru?: YakaTuru; // 3 İplik için opsiyonel
  ucIplikModeli?: UcIplikModeli; // 3 İplik için model
  polarModeli?: PolarModeli; // Polar için model
  nakisBaskiDurumu: NakisBaskiDurumu;
  bedenTablosu: BedenTablosu;
  toplamUrun: number;
  not: string;
  tarih: Date;
  // Kombinasyon görseli
  kombinasyonGorsel?: string;
} 