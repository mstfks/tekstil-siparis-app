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
export type NakisBaskiDurumu = 'on' | 'on-arka' | 'on-1kol' | 'on-kollar' | 'arka' | 'arka-1kol' | 'arka-kollar' | '1kol' | 'kollar' | 'on-arka-kollar' | 'dikilecek' | 'sorulacak';
export type SiparisTuru = 'suprem' | 'lakost' | 'yagmurdesen';
export type SiparisDurumu = 'beklemede' | 'tamamlandi' | 'iptal';

export interface BedenTablosu {
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
  kolTuru: KolTuru;
  yakaTuru: YakaTuru;
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
  kolTuru: KolTuru;
  yakaTuru: YakaTuru;
  nakisBaskiDurumu: NakisBaskiDurumu;
  bedenTablosu: BedenTablosu;
  toplamUrun: number;
  not: string;
  tarih: Date;
  // Kombinasyon görseli
  kombinasyonGorsel?: string;
} 