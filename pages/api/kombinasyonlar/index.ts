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
        const isim = Array.isArray(fields.isim) ? fields.isim[0] : fields.isim;
        
        // Dosyayı çıkar
        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        
        if (!file || !siparisTuru || !renkId || !kolTuru || !yakaTuru) {
          return res.status(400).json({ error: 'Eksik parametreler' });
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
        const yeniKombinasyon = new UrunKombinasyonu({
          siparisTuru,
          renkId,
          kolTuru,
          yakaTuru,
          gorsel: uploadResult.secure_url,
          isim: isim || 'İsimsiz Kombinasyon'
        });

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