import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../src/lib/mongodb';
import { Siparis } from '../../../src/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const siparisler = await Siparis.find()
          .populate('musteriId')
          .populate('renkId')
          .sort({ createdAt: -1 });
        res.status(200).json(siparisler);
      } catch (error) {
        console.error('Siparişler getirme hatası:', error);
        res.status(500).json({ error: 'Siparişler getirilemedi' });
      }
      break;

    case 'POST':
      try {
        const siparisData = req.body;
        
        // Sipariş numarası oluştur
        const sonSiparis = await Siparis.findOne().sort({ siparisNo: -1 });
        const yeniSiparisNo = sonSiparis ? sonSiparis.siparisNo + 1 : 1;
        
        // Toplam ürün hesapla
        const toplamUrun = Object.values(siparisData.bedenTablosu as Record<string, number>).reduce((a, b) => a + b, 0);
        
        const yeniSiparis = new Siparis({
          ...siparisData,
          siparisNo: yeniSiparisNo,
          toplamUrun,
          durum: 'beklemede'
        });

        await yeniSiparis.save();
        await yeniSiparis.populate(['musteriId', 'renkId']);
        
        res.status(201).json(yeniSiparis);
      } catch (error) {
        console.error('Sipariş ekleme hatası:', error);
        res.status(500).json({ error: 'Sipariş eklenemedi' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 