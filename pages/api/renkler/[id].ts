import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../src/lib/mongodb';
import { Renk } from '../../../src/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  await connectDB();

  switch (req.method) {
    case 'DELETE':
      try {
        const renk = await Renk.findByIdAndDelete(id);
        if (!renk) {
          return res.status(404).json({ error: 'Renk bulunamadı' });
        }
        res.status(200).json({ message: 'Renk silindi' });
      } catch (error) {
        console.error('Renk silme hatası:', error);
        res.status(500).json({ error: 'Renk silinemedi' });
      }
      break;

    case 'PUT':
      try {
        const { sira } = req.body;
        const renk = await Renk.findByIdAndUpdate(
          id,
          { sira },
          { new: true }
        );
        if (!renk) {
          return res.status(404).json({ error: 'Renk bulunamadı' });
        }
        res.status(200).json(renk);
      } catch (error) {
        console.error('Renk güncelleme hatası:', error);
        res.status(500).json({ error: 'Renk güncellenemedi' });
      }
      break;

    default:
      res.setHeader('Allow', ['DELETE', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 