import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { SiparisTuru, KolTuru, YakaTuru } from '../types';
import './GorsellerSayfasi.css';

const GorsellerSayfasi: React.FC = () => {
  const { 
    renkler, 
    urunKombinasyonlari,
    kombinasyonEkle,
    kombinasyonSil
  } = useAppContext();

  const [formData, setFormData] = useState({
    siparisTuru: 'suprem' as SiparisTuru,
    renkId: '',
    kolTuru: 'kisa' as KolTuru,
    yakaTuru: 'bisiklet' as YakaTuru,
    isim: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // İsim otomatik oluştur
    if (name !== 'isim') {
      updateAutoName({ ...formData, [name]: value });
    }
  };

  const updateAutoName = (data: typeof formData) => {
    if (data.renkId) {
      const renk = renkler.find(r => r.id === data.renkId);
      
      const siparisTuruText = data.siparisTuru === 'suprem' ? 'Süprem' : 
                              data.siparisTuru === 'lakost' ? 'Lakost' : 
                              data.siparisTuru === 'yagmurdesen' ? 'Yağmurdesen' : data.siparisTuru;
      
      const kolTuruText = data.kolTuru === 'kisa' ? 'Kısa Kol' : 
                          data.kolTuru === 'uzun' ? 'Uzun Kol' : 
                          data.kolTuru === 'yetim' ? 'Yetim Kol' :
                          data.kolTuru === 'kisa-ribanali' ? 'Kısa Ribanalı' : data.kolTuru;
      
      const yakaTuruText = data.yakaTuru === 'bisiklet' ? 'Bisiklet Yaka' : 
                           data.yakaTuru === 'v' ? 'V Yaka' :
                           data.yakaTuru === 'polo' ? 'Polo Yaka' : data.yakaTuru;
      
      const autoName = `${siparisTuruText} - ${renk?.isim} - ${kolTuruText} - ${yakaTuruText}`;
      setFormData(prev => ({ ...prev, isim: autoName }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.renkId || !selectedFile || !previewUrl) {
      alert('Lütfen tüm alanları doldurun ve bir görsel seçin.');
      return;
    }

    kombinasyonEkle({
      siparisTuru: formData.siparisTuru,
      renkId: formData.renkId,
      kolTuru: formData.kolTuru,
      yakaTuru: formData.yakaTuru,
      gorsel: previewUrl,
      isim: formData.isim || 'İsimsiz Kombinasyon'
    });

    // Formu temizle
    setFormData({
      siparisTuru: 'suprem',
      renkId: '',
      kolTuru: 'kisa',
      yakaTuru: 'bisiklet',
      isim: '',
    });
    setSelectedFile(null);
    setPreviewUrl('');
    
    alert('Kombinasyon başarıyla eklendi!');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu kombinasyonu silmek istediğinizden emin misiniz?')) {
      kombinasyonSil(id);
    }
  };

  const getRenkIsmi = (renkId: string) => {
    return renkler.find(r => r.id === renkId)?.isim || 'Bilinmeyen Renk';
  };

  const kolTurleri = [
    { value: 'kisa', label: 'Kısa Kol' },
    { value: 'uzun', label: 'Uzun Kol' },
    { value: 'yetim', label: 'Yetim Kol' },
    { value: 'kisa-ribanali', label: 'Kısa Ribanalı' }
  ];

  const yakaTurleri = [
    { value: 'bisiklet', label: 'Bisiklet Yaka' },
    { value: 'v', label: 'V Yaka' },
    { value: 'polo', label: 'Polo Yaka' }
  ];

  return (
    <div className="gorseller-sayfasi">
      <h1>Ürün Kombinasyonu Yönetimi</h1>
      <p className="aciklama">
        Sipariş türü, renk, kol türü ve yaka türü kombinasyonları için görseller ekleyin.
      </p>
      
      <div className="kombinasyon-container">
        {/* Yeni Kombinasyon Ekleme Formu */}
        <div className="kombinasyon-form-container">
          <h2>Yeni Kombinasyon Ekle</h2>
          <form onSubmit={handleSubmit} className="kombinasyon-form">
            <div className="form-row">
              <div className="form-grup">
                <label htmlFor="siparisTuru">Sipariş Türü</label>
                <select
                  id="siparisTuru"
                  name="siparisTuru"
                  value={formData.siparisTuru}
                  onChange={handleInputChange}
                  required
                >
                  <option value="suprem">Süprem</option>
                  <option value="lakost">Lakost</option>
                  <option value="yagmurdesen">Yağmurdesen</option>
                </select>
              </div>

              <div className="form-grup">
                <label htmlFor="renkId">Renk</label>
                <select
                  id="renkId"
                  name="renkId"
                  value={formData.renkId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Renk seçiniz</option>
                  {renkler.map(renk => (
                    <option key={renk.id} value={renk.id}>
                      {renk.isim}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-grup">
                <label htmlFor="kolTuru">Kol Türü</label>
                <select
                  id="kolTuru"
                  name="kolTuru"
                  value={formData.kolTuru}
                  onChange={handleInputChange}
                  required
                >
                  {kolTurleri.map(kol => (
                    <option key={kol.value} value={kol.value}>
                      {kol.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grup">
                <label htmlFor="yakaTuru">Yaka Türü</label>
                <select
                  id="yakaTuru"
                  name="yakaTuru"
                  value={formData.yakaTuru}
                  onChange={handleInputChange}
                  required
                >
                  {yakaTurleri.map(yaka => (
                    <option key={yaka.value} value={yaka.value}>
                      {yaka.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grup">
              <label htmlFor="isim">Kombinasyon İsmi</label>
              <input
                type="text"
                id="isim"
                name="isim"
                value={formData.isim}
                onChange={handleInputChange}
                placeholder="Otomatik oluşturulacak..."
              />
            </div>

            <div className="form-grup">
              <label htmlFor="gorsel">Ürün Görseli</label>
              <input
                type="file"
                id="gorsel"
                accept="image/*"
                onChange={handleFileSelect}
                required
              />
              {previewUrl && (
                <div className="gorsel-preview">
                  <img src={previewUrl} alt="Önizleme" />
                </div>
              )}
            </div>

            <button type="submit" className="kaydet-btn">
              Kombinasyonu Kaydet
            </button>
          </form>
        </div>

        {/* Mevcut Kombinasyonlar */}
        <div className="mevcut-kombinasyonlar">
          <h2>Mevcut Kombinasyonlar ({urunKombinasyonlari.length})</h2>
          
          {urunKombinasyonlari.length === 0 ? (
            <div className="bos-liste">
              <p>Henüz kombinasyon eklenmemiş.</p>
            </div>
          ) : (
            <div className="kombinasyon-grid">
              {urunKombinasyonlari.map(kombinasyon => (
                <div key={kombinasyon.id} className="kombinasyon-kart">
                  <div className="kombinasyon-gorsel">
                    <img src={kombinasyon.gorsel} alt={kombinasyon.isim} />
                  </div>
                  <div className="kombinasyon-bilgi">
                    <h3>{kombinasyon.isim}</h3>
                    <div className="kombinasyon-detaylar">
                      <p><strong>Renk:</strong> {getRenkIsmi(kombinasyon.renkId)}</p>
                      <p><strong>Kol:</strong> {kolTurleri.find(k => k.value === kombinasyon.kolTuru)?.label}</p>
                      <p><strong>Yaka:</strong> {yakaTurleri.find(y => y.value === kombinasyon.yakaTuru)?.label}</p>
                    </div>
                    <button 
                      className="sil-btn"
                      onClick={() => handleDelete(kombinasyon.id)}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GorsellerSayfasi; 