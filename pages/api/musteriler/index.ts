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

    case 'PUT':
      try {
        const { siralamaListesi } = req.body;
        
        if (!Array.isArray(siralamaListesi)) {
          return res.status(400).json({ error: 'Geçersiz sıralama listesi' });
        }

        // Batch update işlemi
        const updatePromises = siralamaListesi.map((item: { id: string, sira: number }) => 
          Musteri.findByIdAndUpdate(item.id, { sira: item.sira }, { new: true })
        );

        await Promise.all(updatePromises);
        
        // Güncellenmiş müşteri listesini geri döndür
        const guncelMusteriler = await Musteri.find().sort({ sira: 1 });
        res.status(200).json(guncelMusteriler);
      } catch (error) {
        res.status(500).json({ error: 'Müşteri sıralaması güncellenemedi' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 