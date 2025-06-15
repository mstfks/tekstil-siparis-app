import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../src/lib/mongodb';
import { UrunKombinasyonu } from '../../../src/models';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary konfigürasyonu
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  await connectDB();

  switch (req.method) {
    case 'DELETE':
      try {
        const kombinasyon = await UrunKombinasyonu.findById(id);
        if (!kombinasyon) {
          return res.status(404).json({ error: 'Kombinasyon bulunamadı' });
        }

        // Cloudinary'den görseli sil
        if (kombinasyon.gorsel) {
          const publicId = kombinasyon.gorsel.split('/').pop()?.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`tekstil-siparis/${publicId}`);
          }
        }

        await UrunKombinasyonu.findByIdAndDelete(id);
        res.status(200).json({ message: 'Kombinasyon silindi' });
      } catch (error) {
        res.status(500).json({ error: 'Kombinasyon silinemedi' });
      }
      break;

    default:
      res.setHeader('Allow', ['DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 