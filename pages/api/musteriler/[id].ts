import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../src/lib/mongodb';
import { Musteri } from '../../../src/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  await connectDB();

  switch (req.method) {
    case 'DELETE':
      try {
        const musteri = await Musteri.findByIdAndDelete(id);
        if (!musteri) {
          return res.status(404).json({ error: 'Müşteri bulunamadı' });
        }
        res.status(200).json({ message: 'Müşteri silindi' });
      } catch (error) {
        console.error('Müşteri silme hatası:', error);
        res.status(500).json({ error: 'Müşteri silinemedi' });
      }
      break;

    case 'PUT':
      try {
        const { sira } = req.body;
        const musteri = await Musteri.findByIdAndUpdate(
          id,
          { sira },
          { new: true }
        );
        if (!musteri) {
          return res.status(404).json({ error: 'Müşteri bulunamadı' });
        }
        res.status(200).json(musteri);
      } catch (error) {
        console.error('Müşteri güncelleme hatası:', error);
        res.status(500).json({ error: 'Müşteri güncellenemedi' });
      }
      break;

    default:
      res.setHeader('Allow', ['DELETE', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 