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
  kolTuru: { type: String, required: false }, // 3 İplik için opsiyonel
  yakaTuru: { type: String, required: false }, // 3 İplik için opsiyonel
  ucIplikModeli: { type: String, required: false }, // 3 İplik için model
  polarModeli: { type: String, required: false }, // Polar için model
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
  kolTuru: { type: String, required: false }, // 3 İplik için opsiyonel
  yakaTuru: { type: String, required: false }, // 3 İplik için opsiyonel
  ucIplikModeli: { type: String, required: false }, // 3 İplik için model
  polarModeli: { type: String, required: false }, // Polar için model
  nakisBaskiDurumu: { type: String, required: true },
  bedenTablosu: { type: mongoose.Schema.Types.Mixed, required: true },
  toplamUrun: { type: Number, required: true },
  not: { type: String, default: '' },
  kombinasyonGorsel: { type: String } // Cloudinary URL
}, { timestamps: true });

// Modelleri export et
export const Musteri = mongoose.models.Musteri || mongoose.model('Musteri', MusteriSchema);
export const Renk = mongoose.models.Renk || mongoose.model('Renk', RenkSchema);
export const UrunKombinasyonu = mongoose.models.UrunKombinasyonu || mongoose.model('UrunKombinasyonu', UrunKombinasyonuSchema);
export const Siparis = mongoose.models.Siparis || mongoose.model('Siparis', SiparisSchema); 