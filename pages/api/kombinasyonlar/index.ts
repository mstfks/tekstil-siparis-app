import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../src/lib/mongodb';
import { UrunKombinasyonu } from '../../../src/models';

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
        const kombinasyonData = req.body;
        
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