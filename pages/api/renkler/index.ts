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

    case 'PUT':
      try {
        const { siralamaListesi } = req.body;
        
        if (!Array.isArray(siralamaListesi)) {
          return res.status(400).json({ error: 'Geçersiz sıralama listesi' });
        }

        // Batch update işlemi
        const updatePromises = siralamaListesi.map((item: { id: string, sira: number }) => 
          Renk.findByIdAndUpdate(item.id, { sira: item.sira }, { new: true })
        );

        await Promise.all(updatePromises);
        
        // Güncellenmiş renk listesini geri döndür
        const guncelRenkler = await Renk.find().sort({ sira: 1 });
        res.status(200).json(guncelRenkler);
      } catch (error) {
        res.status(500).json({ error: 'Renk sıralaması güncellenemedi' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 