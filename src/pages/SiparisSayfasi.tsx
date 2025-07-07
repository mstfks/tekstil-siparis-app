import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../context/AppContext';
import { useUI } from '../context/UIContext';
import { KolTuru, YakaTuru, NakisBaskiDurumu, BedenTablosu, SiparisTuru, UcIplikModeli, PolarModeli } from '../types';

const SiparisSayfasi: React.FC = () => {
  const router = useRouter();
  const { showToast } = useUI();
  const { 
    musteriler, 
    renkler, 
    urunKombinasyonlari,
    siparisEkle,
    kombinasyonBul
  } = useAppContext();

  const [formData, setFormData] = useState({
    siparisTuru: 'suprem' as SiparisTuru,
    musteriId: '',
    renkId: '',
    kolTuru: 'kisa' as KolTuru,
    yakaTuru: 'bisiklet' as YakaTuru,
    ucIplikModeli: 'dik-yaka-mont' as UcIplikModeli,
    polarModeli: 'dik-yaka-mont' as PolarModeli,
    nakisBaskiDurumu: 'on' as NakisBaskiDurumu,
    siparisTarihi: new Date().toISOString().split('T')[0],
    not: '',
  });

  const [bedenTablosu, setBedenTablosu] = useState<BedenTablosu>({
    XXS: 0,
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
    { value: '3iplik', label: '3 İplik' },
    { value: 'polar', label: 'Polar' },
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
    { value: 'on-arka-1kol', label: 'Ön, Arka ve Tek Kol' },
    { value: 'dikilecek', label: 'Dikilecek' },
    { value: 'sorulacak', label: 'Sorulacak' },
  ];

  const ucIplikModelleri = [
    { value: 'dik-yaka-mont', label: 'Dik Yaka Mont' },
    { value: 'bisiklet-yaka-sivit', label: 'Bisiklet Yaka Sivit' },
    { value: 'kapusonlu-sivit', label: 'Kapüşonlu Sivit' },
    { value: 'kisa-fermuarli-sivit', label: 'Kısa Fermuarlı Sivit' },
    { value: 'kapusonlu-mont', label: 'Kapüşonlu Mont' },
    { value: 'polo-yaka-sivit', label: 'Polo Yaka Sivit' },
  ];

  const polarModelleri = [
    { value: 'dik-yaka-mont', label: 'Dik Yaka Mont' },
          { value: 'kisa-fermuarli-sivit', label: 'Kısa Fermuarlı Sivit' },
          { value: 'kapusonlu-mont', label: 'Kapüşonlu Mont' },
          { value: 'sal-70cm', label: 'Şal 70 cm' },
          { value: 'sal-90cm', label: 'Şal 90 cm' },
  ];

  // Kombinasyon görselini bul
  const getKombinasyonGorsel = () => {
    if (formData.renkId) {
      if (formData.siparisTuru === '3iplik') {
        return kombinasyonBul(formData.siparisTuru, formData.renkId, undefined, undefined, formData.ucIplikModeli);
      } else if (formData.siparisTuru === 'polar') {
        return kombinasyonBul(formData.siparisTuru, formData.renkId, undefined, undefined, undefined, formData.polarModeli);
      } else {
        return kombinasyonBul(formData.siparisTuru, formData.renkId, formData.kolTuru, formData.yakaTuru);
      }
    }
    return undefined;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'siparisTuru') {
      let defaultYaka = 'bisiklet';
      
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
    const trimmedBeden = yeniBeden.trim().toUpperCase();
    if (trimmedBeden && !bedenTablosu.hasOwnProperty(trimmedBeden) && !ekstraBedenler.hasOwnProperty(trimmedBeden)) {
      setEkstraBedenler(prev => ({
        ...prev,
        [trimmedBeden]: 0
      }));
      setYeniBeden('');
    } else if (trimmedBeden && (bedenTablosu.hasOwnProperty(trimmedBeden) || ekstraBedenler.hasOwnProperty(trimmedBeden))) {
      showToast('Bu beden zaten mevcut!', 'warning');
    } else if (!trimmedBeden) {
      showToast('Lütfen geçerli bir beden adı giriniz!', 'warning');
    }
  };

  const ekstraBedenSil = (beden: string) => {
    setEkstraBedenler(prev => {
      const yeni = { ...prev };
      delete yeni[beden];
      return yeni;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.musteriId || !formData.renkId) {
      showToast('Lütfen müşteri ve renk seçiniz.', 'warning');
      return;
    }

    const toplamBeden = Object.values(bedenTablosu).reduce((a, b) => a + b, 0) + 
                       Object.values(ekstraBedenler).reduce((a, b) => a + b, 0);

    if (toplamBeden === 0) {
      showToast('Lütfen en az bir beden için adet giriniz.', 'warning');
      return;
    }

    const seciliMusteri = musteriler.find(m => m.id === formData.musteriId);
    const seciliRenk = renkler.find(r => r.id === formData.renkId);

    if (!seciliMusteri || !seciliRenk) {
      showToast('Müşteri veya renk bulunamadı.', 'error');
      return;
    }

    const tumBedenler = { ...bedenTablosu, ...ekstraBedenler };

    const siparisData: any = {
      siparisTuru: formData.siparisTuru,
      musteriId: formData.musteriId,
      musteriIsmi: seciliMusteri.isim,
      renkId: formData.renkId,
      renkIsmi: seciliRenk.isim,
      nakisBaskiDurumu: formData.nakisBaskiDurumu,
      bedenTablosu: tumBedenler,
      not: formData.not,
    };

    if (formData.siparisTuru === '3iplik') {
      siparisData.ucIplikModeli = formData.ucIplikModeli;
    } else if (formData.siparisTuru === 'polar') {
      siparisData.polarModeli = formData.polarModeli;
    } else {
      siparisData.kolTuru = formData.kolTuru;
      siparisData.yakaTuru = formData.yakaTuru;
    }

    await siparisEkle(siparisData);
    router.push('/');
  };

  const kombinasyon = getKombinasyonGorsel();
  const toplamUrun = Object.values(bedenTablosu).reduce((a, b) => a + b, 0) + 
                     Object.values(ekstraBedenler).reduce((a, b) => a + b, 0);

  return (
    <div className="modern-siparis-sayfasi">
      {/* Modern Header */}
      <div className="modern-header">
        <div className="header-content">
          <div className="header-left">
            <div className="title-section">
              <h1 className="page-title">
                <span className="title-icon">➕</span>
                Yeni Sipariş Oluştur
              </h1>
            </div>
            <p className="subtitle">Tekstil ürün siparişi detaylarını girin</p>
          </div>
          
          <div className="header-right">
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="modern-siparis-container">
        <div className="siparis-content">
          {/* Form Section */}
          <div className="form-section">
            <form onSubmit={handleSubmit} className="modern-siparis-form">
              {/* Ürün Türü Seçimi */}
              <div className="form-section-header">
                <h3>
                  <span className="section-icon">👕</span>
                  Ürün Türü
                </h3>
              </div>
              
              <div className="product-type-grid">
                {siparisTurleri.map(tur => (
                  <label key={tur.value} className={`product-type-card ${formData.siparisTuru === tur.value ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="siparisTuru"
                      value={tur.value}
                      checked={formData.siparisTuru === tur.value}
                      onChange={handleInputChange}
                      className="hidden-radio"
                    />
                                         <div className="card-content">
                       <span className="card-label">{tur.label}</span>
                     </div>
                  </label>
                ))}
              </div>

              {/* Müşteri ve Renk Seçimi */}
              <div className="form-section-header">
                <h3>
                  <span className="section-icon">🎯</span>
                  Müşteri ve Renk
                </h3>
              </div>
              
              <div className="form-row">
                <div className="modern-form-group">
                  <label htmlFor="musteriId">
                    <span className="label-icon">👤</span>
                    Müşteri
                  </label>
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

                <div className="modern-form-group">
                  <label htmlFor="renkId">
                    <span className="label-icon">🎨</span>
                    Renk
                  </label>
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
              </div>

              {/* Sipariş Tarihi ve Nakış/Baskı */}
              <div className="form-row">
                <div className="modern-form-group">
                  <label htmlFor="siparisTarihi">
                    <span className="label-icon">📅</span>
                    Sipariş Tarihi
                  </label>
                  <input
                    type="date"
                    id="siparisTarihi"
                    name="siparisTarihi"
                    value={formData.siparisTarihi}
                    onChange={handleInputChange}
                    required
                    className="modern-input date-input"
                  />
                </div>

                <div className="modern-form-group">
                  <label htmlFor="nakisBaskiDurumu">
                    <span className="label-icon">🎨</span>
                    Nakış/Baskı Durumu
                  </label>
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

              {/* Model/Kol-Yaka Seçimi */}
              {formData.siparisTuru === '3iplik' ? (
                <div className="form-section-header">
                  <h3>
                    <span className="section-icon">🧥</span>
                    3 İplik Modeli
                  </h3>
                  <div className="form-row">
                    <div className="modern-form-group">
                      <label htmlFor="ucIplikModeli">
                        <span className="label-icon">🏷️</span>
                        Model
                      </label>
                      <select
                        id="ucIplikModeli"
                        name="ucIplikModeli"
                        value={formData.ucIplikModeli}
                        onChange={handleInputChange}
                        className="modern-select"
                      >
                        {ucIplikModelleri.map(model => (
                          <option key={model.value} value={model.value}>
                            {model.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : formData.siparisTuru === 'polar' ? (
                <div className="form-section-header">
                  <h3>
                    <span className="section-icon">🧣</span>
                    Polar Modeli
                  </h3>
                  <div className="form-row">
                    <div className="modern-form-group">
                      <label htmlFor="polarModeli">
                        <span className="label-icon">🏷️</span>
                        Model
                      </label>
                      <select
                        id="polarModeli"
                        name="polarModeli"
                        value={formData.polarModeli}
                        onChange={handleInputChange}
                        className="modern-select"
                      >
                        {polarModelleri.map(model => (
                          <option key={model.value} value={model.value}>
                            {model.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="form-section-header">
                  <h3>
                    <span className="section-icon">✂️</span>
                    Kol ve Yaka Bilgileri
                  </h3>
                  <div className="form-row">
                    <div className="modern-form-group">
                      <label htmlFor="kolTuru">
                        <span className="label-icon">👔</span>
                        Kol Bilgisi
                      </label>
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

                    <div className="modern-form-group">
                      <label htmlFor="yakaTuru">
                        <span className="label-icon">👕</span>
                        Yaka Bilgisi
                      </label>
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
                        <option value="hakim">Hakim Yaka</option>
                        <option value="gomlek">Gömlek Yaka</option>
                        <option value="yapma">Yapma Yaka</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Beden Tablosu */}
              <div className="form-section-header">
                <h3>
                  <span className="section-icon">📏</span>
                  Beden Tablosu
                </h3>
              </div>
              
              <div className="modern-beden-container">
                <div className="beden-grid">
                  {Object.entries(bedenTablosu).map(([beden, adet]) => (
                    <div key={beden} className="modern-beden-input">
                      <label className="beden-label">{beden}</label>
                      <input
                        type="text"
                        value={adet}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d+$/.test(value)) {
                            handleBedenChange(beden, parseInt(value) || 0);
                          }
                        }}
                        className="beden-input-field"
                      />
                    </div>
                  ))}
                </div>

                {Object.keys(ekstraBedenler).length > 0 && (
                  <div className="ekstra-bedenler-section">
                    <h4 className="ekstra-bedenler-title">
                      <span className="section-icon">➕</span>
                      Ekstra Bedenler
                    </h4>
                    <div className="beden-grid">
                      {Object.entries(ekstraBedenler).map(([beden, adet]) => (
                        <div key={beden} className="modern-beden-input ekstra">
                          <label className="beden-label">{beden}</label>
                          <div className="ekstra-beden-controls">
                            <input
                              type="text"
                              value={adet}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d+$/.test(value)) {
                                  handleBedenChange(beden, parseInt(value) || 0);
                                }
                              }}
                              className="beden-input-field"
                            />
                            <button
                              type="button"
                              className="modern-sil-btn"
                              onClick={() => ekstraBedenSil(beden)}
                              title="Bedeni sil"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="yeni-beden-section">
                  <div className="yeni-beden-input">
                    <input
                      type="text"
                      placeholder="Yeni beden adı (örn: 5XL, XXXL)"
                      value={yeniBeden}
                      onChange={(e) => setYeniBeden(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          ekstraBedenEkle();
                        }
                      }}
                      className="modern-input"
                    />
                    <button 
                      type="button" 
                      onClick={ekstraBedenEkle} 
                      className="modern-ekle-btn"
                    >
                      <span className="btn-icon">➕</span>
                      Beden Ekle
                    </button>
                  </div>
                </div>
              </div>

              {/* Notlar */}
              <div className="form-section-header">
                <h3>
                  <span className="section-icon">📝</span>
                  Ekstra Notlar
                </h3>
              </div>
              
              <div className="modern-form-group">
                <textarea
                  id="not"
                  name="not"
                  value={formData.not}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Siparişle ilgili özel notlar, dikkat edilmesi gereken hususlar veya ek bilgiler yazabilirsiniz..."
                  className="modern-textarea"
                />
              </div>

              {/* Form Actions */}
              <div className="modern-form-actions">
                <button 
                  type="button" 
                  onClick={() => router.push('/')} 
                  className="modern-iptal-btn"
                >
                  <span className="btn-icon">✕</span>
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="modern-kaydet-btn"
                  disabled={!formData.musteriId || !formData.renkId || toplamUrun === 0}
                >
                  <span className="btn-icon">💾</span>
                  Siparişi Kaydet
                </button>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <div className="preview-section">
            <div className="preview-header">
              <h3>
                <span className="section-icon">👁️</span>
                Ürün Önizlemesi
              </h3>
            </div>
            
            <div className="preview-content">
              {kombinasyon ? (
                <div className="product-preview">
                  <div className="preview-image">
                    <img src={kombinasyon.gorsel} alt={kombinasyon.isim} />
                  </div>
                  <div className="preview-info">
                    <h4 className="product-name">{kombinasyon.isim}</h4>
                    <div className="product-specs">
                      <div className="spec-item">
                        <span className="spec-label">Tür:</span>
                        <span className="spec-value">
                          {siparisTurleri.find(t => t.value === formData.siparisTuru)?.label}
                        </span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Renk:</span>
                        <span className="spec-value">
                          🎨 {renkler.find(r => r.id === formData.renkId)?.isim}
                        </span>
                      </div>
                      {formData.siparisTuru === '3iplik' ? (
                        <div className="spec-item">
                          <span className="spec-label">Model:</span>
                          <span className="spec-value">
                            {ucIplikModelleri.find(m => m.value === formData.ucIplikModeli)?.label}
                          </span>
                        </div>
                      ) : formData.siparisTuru === 'polar' ? (
                        <div className="spec-item">
                          <span className="spec-label">Model:</span>
                          <span className="spec-value">
                            {polarModelleri.find(m => m.value === formData.polarModeli)?.label}
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="spec-item">
                            <span className="spec-label">Kol:</span>
                            <span className="spec-value">
                              {formData.kolTuru === 'kisa' ? 'Kısa Kol' : 
                               formData.kolTuru === 'uzun' ? 'Uzun Kol' : 
                               formData.kolTuru === 'yetim' ? 'Yetim Kol' : 'Kısa Ribanalı'}
                            </span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">Yaka:</span>
                            <span className="spec-value">
                              {formData.yakaTuru === 'bisiklet' ? 'Bisiklet Yaka' : 
                               formData.yakaTuru === 'v' ? 'V Yaka' : 
                               formData.yakaTuru === 'polo' ? 'Polo Yaka' :
                               formData.yakaTuru === 'hakim' ? 'Hakim Yaka' :
                               formData.yakaTuru === 'gomlek' ? 'Gömlek Yaka' :
                               formData.yakaTuru === 'yapma' ? 'Yapma Yaka' : formData.yakaTuru}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-preview">
                  <div className="no-preview-icon">📷</div>
                  <h4>Ürün Görseli Bulunamadı</h4>
                  <p>Bu kombinasyon için henüz görsel eklenmemiş.</p>
                  {formData.renkId && (
                    <div className="selected-combo">
                      <p><strong>Seçili Kombinasyon:</strong></p>
                      <div className="combo-details">
                        <span className="combo-type">
                          {siparisTurleri.find(t => t.value === formData.siparisTuru)?.label}
                        </span>
                        <span className="combo-color">
                          🎨 {renkler.find(r => r.id === formData.renkId)?.isim}
                        </span>
                      </div>
                    </div>
                  )}
                  <button 
                    type="button" 
                    className="add-image-btn"
                    onClick={() => router.push('/gorseller')}
                  >
                    <span className="btn-icon">📸</span>
                    Görsel Ekle
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <h4 className="summary-title">
                <span className="section-icon">📊</span>
                Sipariş Özeti
              </h4>
              <div className="summary-items">
                <div className="summary-item">
                  <span className="summary-label">👤 Müşteri:</span>
                  <span className="summary-value">
                    {musteriler.find(m => m.id === formData.musteriId)?.isim || 'Seçilmedi'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">📦 Toplam Ürün:</span>
                  <span className="summary-value highlight">{toplamUrun} adet</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">🎨 Nakış/Baskı:</span>
                  <span className="summary-value">
                    {nakisBaskiSecenekleri.find(s => s.value === formData.nakisBaskiDurumu)?.label}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">📅 Tarih:</span>
                  <span className="summary-value">
                    {new Date(formData.siparisTarihi).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiparisSayfasi; 