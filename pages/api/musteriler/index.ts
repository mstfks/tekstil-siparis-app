import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../src/lib/mongodb';
import { Musteri } from '../../../src/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const musteriler = await Musteri.find().sort({ sira: 1 });
        res.status(200).json(musteriler);
      } catch (error) {
        res.status(500).json({ error: 'Müşteriler getirilemedi' });
      }
      break;

    case 'POST':
      try {
        const { isim } = req.body;
        
        // En yüksek sıra numarasını bul
        const sonMusteri = await Musteri.findOne().sort({ sira: -1 });
        const yeniSira = sonMusteri ? sonMusteri.sira + 1 : 1;

        const yeniMusteri = new Musteri({
          isim,
          sira: yeniSira
        });

        await yeniMusteri.save();
        res.status(201).json(yeniMusteri);
      } catch (error) {
        res.status(500).json({ error: 'Müşteri eklenemedi' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 