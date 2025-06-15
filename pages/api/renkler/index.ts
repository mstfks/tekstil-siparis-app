import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../src/lib/mongodb';
import { Renk } from '../../../src/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const renkler = await Renk.find().sort({ sira: 1 });
        res.status(200).json(renkler);
      } catch (error) {
        res.status(500).json({ error: 'Renkler getirilemedi' });
      }
      break;

    case 'POST':
      try {
        const { isim, kod } = req.body;
        
        // En yüksek sıra numarasını bul
        const sonRenk = await Renk.findOne().sort({ sira: -1 });
        const yeniSira = sonRenk ? sonRenk.sira + 1 : 1;

        const yeniRenk = new Renk({
          isim,
          kod,
          sira: yeniSira
        });

        await yeniRenk.save();
        res.status(201).json(yeniRenk);
      } catch (error) {
        res.status(500).json({ error: 'Renk eklenemedi' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 