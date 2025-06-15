import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../context/AppContext';
import { KolTuru, YakaTuru, NakisBaskiDurumu, BedenTablosu, SiparisTuru } from '../types';
import './SiparisSayfasi.css';

const SiparisSayfasi: React.FC = () => {
  const router = useRouter();
  const { 
    musteriler, 
    renkler, 
    siparisEkle,
    kombinasyonBul
  } = useAppContext();

  const [formData, setFormData] = useState({
    siparisTuru: 'suprem' as SiparisTuru,
    musteriId: '',
    renkId: '',
    kolTuru: 'kisa' as KolTuru,
    yakaTuru: 'bisiklet' as YakaTuru,
    nakisBaskiDurumu: 'on' as NakisBaskiDurumu,
    not: '',
  });

  const [bedenTablosu, setBedenTablosu] = useState<BedenTablosu>({
    XS: 0,
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0,
    '3XL': 0,
    '4XL': 0,
  });

  const [ekstraBedenler, setEkstraBedenler] = useState<{ [key: string]: number }>({});
  const [yeniBeden, setYeniBeden] = useState('');

  const siparisTurleri = [
    { value: 'suprem', label: 'Süprem' },
    { value: 'lakost', label: 'Lakost' },
    { value: 'yagmurdesen', label: 'Yağmurdesen' },
  ];

  const nakisBaskiSecenekleri = [
    { value: 'on', label: 'Ön' },
    { value: 'on-arka', label: 'Ön ve Arka' },
    { value: 'on-1kol', label: 'Ön ve Tek Kol' },
    { value: 'on-kollar', label: 'Ön ve Kollar' },
    { value: 'arka', label: 'Arka' },
    { value: 'arka-1kol', label: 'Arka ve Tek Kol' },
    { value: 'arka-kollar', label: 'Arka ve Kollar' },
    { value: '1kol', label: 'Tek Kol' },
    { value: 'kollar', label: 'Kollar' },
    { value: 'on-arka-kollar', label: 'Ön, Arka ve Kollar' },
    { value: 'dikilecek', label: 'Dikilecek' },
    { value: 'sorulacak', label: 'Sorulacak' },
  ];

  // Kombinasyon görselini bul
  const getKombinasyonGorsel = () => {
    if (formData.renkId) {
      return kombinasyonBul(formData.siparisTuru, formData.renkId, formData.kolTuru, formData.yakaTuru);
    }
    return undefined;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Sipariş türüne göre default yaka tipini ayarla
    if (name === 'siparisTuru') {
      let defaultYaka = 'bisiklet'; // Default olarak bisiklet yaka
      
      if (value === 'lakost') {
        defaultYaka = 'polo';
      } else if (value === 'suprem' || value === 'yagmurdesen') {
        defaultYaka = 'bisiklet';
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: value as SiparisTuru,
        yakaTuru: defaultYaka as YakaTuru
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBedenChange = (beden: string, value: number) => {
    if (beden in bedenTablosu) {
      setBedenTablosu(prev => ({
        ...prev,
        [beden]: value
      }));
    } else {
      setEkstraBedenler(prev => ({
        ...prev,
        [beden]: value
      }));
    }
  };

  const ekstraBedenEkle = () => {
    if (yeniBeden.trim() && !bedenTablosu.hasOwnProperty(yeniBeden) && !ekstraBedenler.hasOwnProperty(yeniBeden)) {
      setEkstraBedenler(prev => ({
        ...prev,
        [yeniBeden.trim()]: 0
      }));
      setYeniBeden('');
    }
  };

  const ekstraBedenSil = (beden: string) => {
    setEkstraBedenler(prev => {
      const yeni = { ...prev };
      delete yeni[beden];
      return yeni;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.musteriId || !formData.renkId) {
      alert('Lütfen müşteri ve renk seçiniz.');
      return;
    }

    const toplamBeden = Object.values(bedenTablosu).reduce((a, b) => a + b, 0) + 
                       Object.values(ekstraBedenler).reduce((a, b) => a + b, 0);

    if (toplamBeden === 0) {
      alert('Lütfen en az bir beden için adet giriniz.');
      return;
    }

    const seciliMusteri = musteriler.find(m => m.id === formData.musteriId);
    const seciliRenk = renkler.find(r => r.id === formData.renkId);

    if (!seciliMusteri || !seciliRenk) {
      alert('Müşteri veya renk bulunamadı.');
      return;
    }

    const tumBedenler = { ...bedenTablosu, ...ekstraBedenler };

    siparisEkle({
      siparisTuru: formData.siparisTuru,
      musteriId: formData.musteriId,
      musteriIsmi: seciliMusteri.isim,
      renkId: formData.renkId,
      renkIsmi: seciliRenk.isim,
      kolTuru: formData.kolTuru,
      yakaTuru: formData.yakaTuru,
      nakisBaskiDurumu: formData.nakisBaskiDurumu,
      bedenTablosu: tumBedenler,
      not: formData.not,
    });

    alert('Sipariş başarıyla oluşturuldu!');
    router.push('/');
  };

  const kombinasyon = getKombinasyonGorsel();

  return (
    <div className="siparis-sayfasi">
      <div className="sayfa-header">
        <h1>Yeni Sipariş Oluştur</h1>
        <p>Tekstil ürün siparişi</p>
      </div>

      <div className="siparis-container">
        <form onSubmit={handleSubmit} className="siparis-form">
          <div className="form-row">
            <div className="form-grup">
              <label htmlFor="siparisTuru">Sipariş Türü *</label>
              <select
                id="siparisTuru"
                name="siparisTuru"
                value={formData.siparisTuru}
                onChange={handleInputChange}
                required
                className="modern-select"
              >
                {siparisTurleri.map(tur => (
                  <option key={tur.value} value={tur.value}>
                    {tur.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grup">
              <label htmlFor="musteriId">Müşteri *</label>
              <select
                id="musteriId"
                name="musteriId"
                value={formData.musteriId}
                onChange={handleInputChange}
                required
                className="modern-select"
              >
                <option value="">Müşteri seçiniz</option>
                {musteriler.map(musteri => (
                  <option key={musteri.id} value={musteri.id}>
                    {musteri.isim}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-grup">
              <label htmlFor="renkId">Renk *</label>
              <select
                id="renkId"
                name="renkId"
                value={formData.renkId}
                onChange={handleInputChange}
                required
                className="modern-select"
              >
                <option value="">Renk seçiniz</option>
                {renkler.map(renk => (
                  <option key={renk.id} value={renk.id}>
                    {renk.isim}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grup">
              <label htmlFor="nakisBaskiDurumu">Nakış/Baskı Durumu</label>
              <select
                id="nakisBaskiDurumu"
                name="nakisBaskiDurumu"
                value={formData.nakisBaskiDurumu}
                onChange={handleInputChange}
                className="modern-select"
              >
                {nakisBaskiSecenekleri.map(secenek => (
                  <option key={secenek.value} value={secenek.value}>
                    {secenek.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-grup">
              <label htmlFor="kolTuru">Kol Bilgisi</label>
              <select
                id="kolTuru"
                name="kolTuru"
                value={formData.kolTuru}
                onChange={handleInputChange}
                className="modern-select"
              >
                <option value="kisa">Kısa Kol</option>
                <option value="uzun">Uzun Kol</option>
                <option value="yetim">Yetim Kol</option>
                <option value="kisa-ribanali">Kısa Ribanalı</option>
              </select>
            </div>

            <div className="form-grup">
              <label htmlFor="yakaTuru">Yaka Bilgisi</label>
              <select
                id="yakaTuru"
                name="yakaTuru"
                value={formData.yakaTuru}
                onChange={handleInputChange}
                className="modern-select"
              >
                <option value="bisiklet">Bisiklet Yaka</option>
                <option value="v">V Yaka</option>
                <option value="polo">Polo Yaka</option>
              </select>
            </div>
          </div>



          <div className="form-grup">
            <label>Beden Tablosu</label>
            <div className="beden-grid">
              {Object.entries(bedenTablosu).map(([beden, adet]) => (
                <div key={beden} className="beden-input">
                  <label>{beden}</label>
                  <input
                    type="number"
                    min="0"
                    value={adet}
                    onChange={(e) => handleBedenChange(beden, parseInt(e.target.value) || 0)}
                  />
                </div>
              ))}
            </div>

            {Object.keys(ekstraBedenler).length > 0 && (
              <div className="ekstra-bedenler">
                <h4>Ekstra Bedenler</h4>
                <div className="beden-grid">
                  {Object.entries(ekstraBedenler).map(([beden, adet]) => (
                    <div key={beden} className="beden-input ekstra">
                      <label>{beden}</label>
                      <div className="ekstra-beden-controls">
                        <input
                          type="number"
                          min="0"
                          value={adet}
                          onChange={(e) => handleBedenChange(beden, parseInt(e.target.value) || 0)}
                        />
                        <button
                          type="button"
                          className="sil-btn"
                          onClick={() => ekstraBedenSil(beden)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="yeni-beden">
              <input
                type="text"
                placeholder="Yeni beden adı"
                value={yeniBeden}
                onChange={(e) => setYeniBeden(e.target.value)}
              />
              <button type="button" onClick={ekstraBedenEkle} className="ekle-btn">
                Beden Ekle
              </button>
            </div>
          </div>

          <div className="form-grup">
            <label htmlFor="not">Ekstra Not</label>
            <textarea
              id="not"
              name="not"
              value={formData.not}
              onChange={handleInputChange}
              rows={4}
              placeholder="İsteğe bağlı notlar..."
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => router.push('/')} className="iptal-btn">
              İptal
            </button>
            <button type="submit" className="kaydet-btn">
              Siparişi Kaydet
            </button>
          </div>
        </form>

        {/* Ürün Önizlemesi */}
        <div className="gorsel-onizleme">
          <h3>Ürün Önizlemesi</h3>
          
          <div className="onizleme-ana">
            {kombinasyon ? (
              <div className="kombinasyon-onizleme">
                <div className="kombinasyon-gorsel-buyuk">
                  <img src={kombinasyon.gorsel} alt={kombinasyon.isim} />
                </div>
                <div className="kombinasyon-bilgi">
                  <h4>{kombinasyon.isim}</h4>
                  <div className="kombinasyon-detaylar">
                    <p><strong>Sipariş Türü:</strong> {
                      formData.siparisTuru === 'suprem' ? 'Süprem' : 
                      formData.siparisTuru === 'lakost' ? 'Lakost' : 'Yağmurdesen'
                    }</p>
                    <p><strong>Renk:</strong> {renkler.find(r => r.id === formData.renkId)?.isim}</p>
                    <p><strong>Kol Türü:</strong> {
                      formData.kolTuru === 'kisa' ? 'Kısa Kol' : 
                      formData.kolTuru === 'uzun' ? 'Uzun Kol' : 
                      formData.kolTuru === 'yetim' ? 'Yetim Kol' : 'Kısa Ribanalı'
                    }</p>
                    <p><strong>Yaka Türü:</strong> {
                      formData.yakaTuru === 'bisiklet' ? 'Bisiklet Yaka' : 
                      formData.yakaTuru === 'v' ? 'V Yaka' : 'Polo Yaka'
                    }</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="kombinasyon-bulunamadi">
                <div className="placeholder-gorsel">
                  <span>📷</span>
                  <h4>Ürün Görseli Bulunamadı</h4>
                  <p>Bu kombinasyon için henüz görsel eklenmemiş.</p>
                  {formData.renkId && (
                    <div className="secili-kombinasyon">
                      <p><strong>Seçili Kombinasyon:</strong></p>
                      <p>{
                        formData.siparisTuru === 'suprem' ? 'Süprem' : 
                        formData.siparisTuru === 'lakost' ? 'Lakost' : 'Yağmurdesen'
                      } - {renkler.find(r => r.id === formData.renkId)?.isim} - {
                        formData.kolTuru === 'kisa' ? 'Kısa Kol' : 
                        formData.kolTuru === 'uzun' ? 'Uzun Kol' : 
                        formData.kolTuru === 'yetim' ? 'Yetim Kol' : 'Kısa Ribanalı'
                      } - {
                        formData.yakaTuru === 'bisiklet' ? 'Bisiklet Yaka' : 
                        formData.yakaTuru === 'v' ? 'V Yaka' : 'Polo Yaka'
                      }</p>
                    </div>
                  )}
                  <button 
                    type="button" 
                    className="gorsel-ekle-btn"
                    onClick={() => router.push('/gorseller')}
                  >
                    Görsel Ekle
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="onizleme-ozet">
            <h4>Sipariş Özeti</h4>
            <div className="ozet-bilgi">
              <p><strong>Müşteri:</strong> {musteriler.find(m => m.id === formData.musteriId)?.isim || 'Seçilmedi'}</p>
              <p><strong>Toplam Ürün:</strong> {Object.values(bedenTablosu).reduce((a, b) => a + b, 0) + Object.values(ekstraBedenler).reduce((a, b) => a + b, 0)} adet</p>
              <p><strong>Nakış/Baskı:</strong> {nakisBaskiSecenekleri.find(s => s.value === formData.nakisBaskiDurumu)?.label}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiparisSayfasi; 