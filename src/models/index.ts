import mongoose from 'mongoose';

// Müşteri Modeli
const MusteriSchema = new mongoose.Schema({
  isim: { type: String, required: true },
  sira: { type: Number, required: true }
}, { timestamps: true });

// Renk Modeli
const RenkSchema = new mongoose.Schema({
  isim: { type: String, required: true },
  kod: { type: String, required: true },
  sira: { type: Number, required: true }
}, { timestamps: true });

// Ürün Kombinasyonu Modeli
const UrunKombinasyonuSchema = new mongoose.Schema({
  siparisTuru: { type: String, required: true },
  renkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Renk', required: true },
  kolTuru: { type: String, required: true },
  yakaTuru: { type: String, required: true },
  gorsel: { type: String, required: true }, // Cloudinary URL
  isim: { type: String, required: true }
}, { timestamps: true });

// Sipariş Modeli
const SiparisSchema = new mongoose.Schema({
  siparisNo: { type: Number, required: true, unique: true },
  siparisTuru: { type: String, required: true },
  durum: { type: String, enum: ['beklemede', 'tamamlandi', 'iptal'], default: 'beklemede' },
  musteriId: { type: mongoose.Schema.Types.ObjectId, ref: 'Musteri', required: true },
  musteriIsmi: { type: String, required: true },
  renkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Renk', required: true },
  renkIsmi: { type: String, required: true },
  kolTuru: { type: String, required: true },
  yakaTuru: { type: String, required: true },
  nakisBaskiDurumu: { type: String, required: true },
  bedenTablosu: {
    XS: { type: Number, default: 0 },
    S: { type: Number, default: 0 },
    M: { type: Number, default: 0 },
    L: { type: Number, default: 0 },
    XL: { type: Number, default: 0 },
    XXL: { type: Number, default: 0 },
    '3XL': { type: Number, default: 0 },
    '4XL': { type: Number, default: 0 }
  },
  toplamUrun: { type: Number, required: true },
  not: { type: String, default: '' },
  kombinasyonGorsel: { type: String } // Cloudinary URL
}, { timestamps: true });

// Modelleri export et
export const Musteri = mongoose.models.Musteri || mongoose.model('Musteri', MusteriSchema);
export const Renk = mongoose.models.Renk || mongoose.model('Renk', RenkSchema);
export const UrunKombinasyonu = mongoose.models.UrunKombinasyonu || mongoose.model('UrunKombinasyonu', UrunKombinasyonuSchema);
export const Siparis = mongoose.models.Siparis || mongoose.model('Siparis', SiparisSchema); 