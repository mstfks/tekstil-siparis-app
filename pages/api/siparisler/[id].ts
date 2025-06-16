import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../src/lib/mongodb';
import { Siparis } from '../../../src/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  await connectDB();

  switch (req.method) {
    case 'PUT':
      try {
        const { durum } = req.body;
        
        const siparis = await Siparis.findByIdAndUpdate(
          id,
          { durum },
          { new: true }
        ).populate(['musteriId', 'renkId']);
        
        if (!siparis) {
          return res.status(404).json({ error: 'Sipariş bulunamadı' });
        }
        
        res.status(200).json(siparis);
      } catch (error) {
        console.error('Sipariş güncelleme hatası:', error);
        res.status(500).json({ error: 'Sipariş güncellenemedi' });
      }
      break;

    case 'DELETE':
      try {
        const siparis = await Siparis.findByIdAndDelete(id);
        if (!siparis) {
          return res.status(404).json({ error: 'Sipariş bulunamadı' });
        }
        res.status(200).json({ message: 'Sipariş silindi' });
      } catch (error) {
        console.error('Sipariş silme hatası:', error);
        res.status(500).json({ error: 'Sipariş silinemedi' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 