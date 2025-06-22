import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../src/lib/mongodb';
import { UrunKombinasyonu } from '../../../src/models';
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import fs from 'fs';

// Cloudinary konfigürasyonu
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Next.js'in otomatik body parse'ını devre dışı bırak
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const kombinasyonlar = await UrunKombinasyonu.find().populate('renkId');
        res.status(200).json(kombinasyonlar);
      } catch (error) {
        console.error('Kombinasyonlar getirme hatası:', error);
        res.status(500).json({ error: 'Kombinasyonlar getirilemedi' });
      }
      break;

    case 'POST':
      try {
        const form = formidable({
          maxFileSize: 10 * 1024 * 1024, // 10MB
        });

        const [fields, files] = await form.parse(req);
        
        // Form verilerini çıkar
        const siparisTuru = Array.isArray(fields.siparisTuru) ? fields.siparisTuru[0] : fields.siparisTuru;
        const renkId = Array.isArray(fields.renkId) ? fields.renkId[0] : fields.renkId;
        const kolTuru = Array.isArray(fields.kolTuru) ? fields.kolTuru[0] : fields.kolTuru;
        const yakaTuru = Array.isArray(fields.yakaTuru) ? fields.yakaTuru[0] : fields.yakaTuru;
        const ucIplikModeli = Array.isArray(fields.ucIplikModeli) ? fields.ucIplikModeli[0] : fields.ucIplikModeli;
        const polarModeli = Array.isArray(fields.polarModeli) ? fields.polarModeli[0] : fields.polarModeli;
        const isim = Array.isArray(fields.isim) ? fields.isim[0] : fields.isim;
        
        // Dosyayı çıkar
        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        
        if (!file || !siparisTuru || !renkId) {
          return res.status(400).json({ error: 'Eksik parametreler' });
        }

        // Sipariş türüne göre gerekli alanları kontrol et
        if (siparisTuru === '3iplik' && !ucIplikModeli) {
          return res.status(400).json({ error: '3 İplik için model gerekli' });
        }
        
        if (siparisTuru === 'polar' && !polarModeli) {
          return res.status(400).json({ error: 'Polar için model gerekli' });
        }
        
        if (siparisTuru !== '3iplik' && siparisTuru !== 'polar' && (!kolTuru || !yakaTuru)) {
          return res.status(400).json({ error: 'Kol türü ve yaka türü gerekli' });
        }

        // Cloudinary'e yükle
        const uploadResult = await cloudinary.uploader.upload(file.filepath, {
          folder: 'tekstil-siparis',
          public_id: `kombinasyon_${Date.now()}`,
          resource_type: 'auto',
        });

        // Geçici dosyayı sil
        fs.unlinkSync(file.filepath);

        // Veritabanına kaydet
        const kombinasyonData: any = {
          siparisTuru,
          renkId,
          gorsel: uploadResult.secure_url,
          isim: isim || 'İsimsiz Kombinasyon'
        };

        // Sipariş türüne göre alanları ekle
        if (siparisTuru === '3iplik') {
          kombinasyonData.ucIplikModeli = ucIplikModeli;
        } else if (siparisTuru === 'polar') {
          kombinasyonData.polarModeli = polarModeli;
        } else {
          kombinasyonData.kolTuru = kolTuru;
          kombinasyonData.yakaTuru = yakaTuru;
        }

        const yeniKombinasyon = new UrunKombinasyonu(kombinasyonData);

        await yeniKombinasyon.save();
        await yeniKombinasyon.populate('renkId');
        
        res.status(201).json(yeniKombinasyon);
      } catch (error) {
        console.error('Kombinasyon ekleme hatası:', error);
        res.status(500).json({ error: 'Kombinasyon eklenemedi' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 