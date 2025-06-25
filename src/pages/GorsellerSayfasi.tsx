import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useUI } from '../context/UIContext';
import { SiparisTuru, KolTuru, YakaTuru, UcIplikModeli, PolarModeli } from '../types';

const GorsellerSayfasi: React.FC = () => {
  const { 
    renkler, 
    urunKombinasyonlari,
    kombinasyonEkle,
    kombinasyonSil,
    kombinasyonBul
  } = useAppContext();
  const { showToast, showConfirmModal } = useUI();

  const [formData, setFormData] = useState({
    siparisTuru: 'suprem' as SiparisTuru,
    renkId: '',
    kolTuru: 'kisa' as KolTuru,
    yakaTuru: 'bisiklet' as YakaTuru,
    ucIplikModeli: 'dik-yaka-mont' as UcIplikModeli,
    polarModeli: 'dik-yaka-mont' as PolarModeli,
    isim: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [acikGruplar, setAcikGruplar] = useState<{ [key: string]: boolean }>({
    suprem: false,
    lakost: false,
    yagmurdesen: false,
    '3iplik': false,
    polar: false
  });

  const [acikAltGruplar, setAcikAltGruplar] = useState<{ [key: string]: boolean }>({});

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
                              data.siparisTuru === 'yagmurdesen' ? 'Yağmurdesen' : 
                              data.siparisTuru === '3iplik' ? '3 İplik' : 
                              data.siparisTuru === 'polar' ? 'Polar' : data.siparisTuru;
      
      let autoName = '';
      
      if (data.siparisTuru === '3iplik') {
        const modelText = data.ucIplikModeli === 'dik-yaka-mont' ? 'Dik Yaka Mont' :
                         data.ucIplikModeli === 'bisiklet-yaka-sivit' ? 'Bisiklet Yaka Sivit' :
                         data.ucIplikModeli === 'kapusonlu-sivit' ? 'Kapüşonlu Sivit' :
                         data.ucIplikModeli === 'kisa-fermuarli-sivit' ? 'Kısa Fermuarlı Sivit' :
                         data.ucIplikModeli === 'kapusonlu-mont' ? 'Kapüşonlu Mont' :
                         data.ucIplikModeli === 'polo-yaka-sivit' ? 'Polo Yaka Sivit' : data.ucIplikModeli;
        
        autoName = `${siparisTuruText} - ${renk?.isim} - ${modelText}`;
      } else if (data.siparisTuru === 'polar') {
        const modelText = data.polarModeli === 'dik-yaka-mont' ? 'Dik Yaka Mont' :
                         data.polarModeli === 'kisa-fermuarli-sivit' ? 'Kısa Fermuarlı Sivit' :
                         data.polarModeli === 'kapusonlu-mont' ? 'Kapüşonlu Mont' :
                         data.polarModeli === 'sal-70cm' ? 'Şal 70 cm' :
                         data.polarModeli === 'sal-90cm' ? 'Şal 90 cm' : data.polarModeli;
        
        autoName = `${siparisTuruText} - ${renk?.isim} - ${modelText}`;
      } else {
        const kolTuruText = data.kolTuru === 'kisa' ? 'Kısa Kol' : 
                            data.kolTuru === 'uzun' ? 'Uzun Kol' : 
                            data.kolTuru === 'yetim' ? 'Yetim Kol' :
                            data.kolTuru === 'kisa-ribanali' ? 'Kısa Ribanalı' : data.kolTuru;
        
        const yakaTuruText = data.yakaTuru === 'bisiklet' ? 'Bisiklet Yaka' : 
                             data.yakaTuru === 'v' ? 'V Yaka' :
                             data.yakaTuru === 'polo' ? 'Polo Yaka' : data.yakaTuru;
        
        autoName = `${siparisTuruText} - ${renk?.isim} - ${kolTuruText} - ${yakaTuruText}`;
      }
      
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.renkId || !selectedFile) {
      showToast('Lütfen tüm alanları doldurun ve bir görsel seçin.', 'warning');
      return;
    }

    // Daha önce kaydedilmiş kombinasyon kontrolü
    let mevcutKombinasyon;
    if (formData.siparisTuru === '3iplik') {
      mevcutKombinasyon = kombinasyonBul(formData.siparisTuru, formData.renkId, undefined, undefined, formData.ucIplikModeli);
    } else if (formData.siparisTuru === 'polar') {
      mevcutKombinasyon = kombinasyonBul(formData.siparisTuru, formData.renkId, undefined, undefined, undefined, formData.polarModeli);
    } else {
      mevcutKombinasyon = kombinasyonBul(formData.siparisTuru, formData.renkId, formData.kolTuru, formData.yakaTuru);
    }
    
    if (mevcutKombinasyon) {
      showToast('Bu kombinasyon için zaten bir görsel kaydedilmiş. Lütfen farklı bir kombinasyon seçin.', 'warning');
      return;
    }

    const kombinasyonData: any = {
      siparisTuru: formData.siparisTuru,
      renkId: formData.renkId,
      gorsel: '', // Bu değer API'de Cloudinary URL ile doldurulacak
      isim: formData.isim || 'İsimsiz Kombinasyon'
    };

    // 3 İplik için model ekle, diğerleri için kol ve yaka bilgisi ekle
    if (formData.siparisTuru === '3iplik') {
      kombinasyonData.ucIplikModeli = formData.ucIplikModeli;
    } else if (formData.siparisTuru === 'polar') {
      kombinasyonData.polarModeli = formData.polarModeli;
    } else {
      kombinasyonData.kolTuru = formData.kolTuru;
      kombinasyonData.yakaTuru = formData.yakaTuru;
    }

    await kombinasyonEkle(kombinasyonData, selectedFile);

    // Formu ilk haline döndür
    setFormData({
      siparisTuru: 'suprem',
      renkId: '',
      kolTuru: 'kisa',
      yakaTuru: 'bisiklet',
      ucIplikModeli: 'dik-yaka-mont',
      polarModeli: 'dik-yaka-mont',
      isim: '',
    });
    setSelectedFile(null);
    setPreviewUrl('');
    
    showToast('Kombinasyon başarıyla eklendi!', 'success');
  };

  const handleDelete = async (id: string) => {
    showConfirmModal({
      title: 'Kombinasyonu Sil',
      message: 'Bu kombinasyonu silmek istediğinizden emin misiniz?',
      confirmText: 'Sil',
      cancelText: 'İptal',
      type: 'danger',
      onConfirm: () => kombinasyonSil(id)
    });
  };

  const getRenkIsmi = (renkId: string | any) => {
    // Eğer renkId bir obje ise (populate edilmiş), direkt ismini döndür
    if (typeof renkId === 'object' && renkId?.isim) {
      return renkId.isim;
    }
    // Değilse, renkler listesinde ara
    return renkler.find(r => r.id === renkId)?.isim || 'Bilinmeyen Renk';
  };

  const toggleGrup = (siparisTuru: string) => {
    setAcikGruplar(prev => ({
      ...prev,
      [siparisTuru]: !prev[siparisTuru]
    }));
  };

  const toggleAltGrup = (grupKey: string) => {
    setAcikAltGruplar(prev => ({
      ...prev,
      [grupKey]: !prev[grupKey]
    }));
  };

  const tumunuToggle = () => {
    const tumGruplarAcik = Object.values(acikGruplar).every(Boolean);
    const yeniDurum = !tumGruplarAcik;
    
    setAcikGruplar({
      suprem: yeniDurum,
      lakost: yeniDurum,
      yagmurdesen: yeniDurum,
      '3iplik': yeniDurum,
      polar: yeniDurum
    });
  };

  // Alt grup oluşturma fonksiyonu
  const getAltGruplar = (kombinasyonlar: any[], siparisTuru: string) => {
    if (siparisTuru === '3iplik') {
      const gruplar: { [key: string]: any[] } = {};
      kombinasyonlar.forEach(k => {
        const model = k.ucIplikModeli;
        if (!gruplar[model]) {
          gruplar[model] = [];
        }
        gruplar[model].push(k);
      });
      return gruplar;
    } else if (siparisTuru === 'polar') {
      const gruplar: { [key: string]: any[] } = {};
      kombinasyonlar.forEach(k => {
        const model = k.polarModeli;
        if (!gruplar[model]) {
          gruplar[model] = [];
        }
        gruplar[model].push(k);
      });
      return gruplar;
    } else {
      const gruplar: { [key: string]: any[] } = {};
      kombinasyonlar.forEach(k => {
        const grupKey = `${k.kolTuru}-${k.yakaTuru}`;
        if (!gruplar[grupKey]) {
          gruplar[grupKey] = [];
        }
        gruplar[grupKey].push(k);
      });
      return gruplar;
    }
  };

  const getAltGrupBaslik = (grupKey: string, siparisTuru: string) => {
    if (siparisTuru === '3iplik') {
      const modelTercumeleri: { [key: string]: string } = {
        'dik-yaka-mont': 'Dik Yaka Mont',
        'bisiklet-yaka-sivit': 'Bisiklet Yaka Sivit',
        'kapusonlu-sivit': 'Kapüşonlu Sivit',
        'kisa-fermuarli-sivit': 'Kısa Fermuarlı Sivit',
        'kapusonlu-mont': 'Kapüşonlu Mont',
        'polo-yaka-sivit': 'Polo Yaka Sivit'
      };
      return modelTercumeleri[grupKey] || grupKey;
    } else if (siparisTuru === 'polar') {
      const modelTercumeleri: { [key: string]: string } = {
        'dik-yaka-mont': 'Dik Yaka Mont',
        'kisa-fermuarli-sivit': 'Kısa Fermuarlı Sivit',
        'kapusonlu-mont': 'Kapüşonlu Mont',
        'sal-70cm': 'Şal 70 cm',
        'sal-90cm': 'Şal 90 cm'
      };
      return modelTercumeleri[grupKey] || grupKey;
    } else {
      // Özel durum: kısa-ribanali kol türü için
      if (grupKey.startsWith('kisa-ribanali-')) {
        const yakaTuru = grupKey.replace('kisa-ribanali-', '');
        const yakaText = yakaTurleri.find(y => y.value === yakaTuru)?.label || yakaTuru;
        return `Kısa Ribanalı - ${yakaText}`;
      } else {
        const [kolTuru, yakaTuru] = grupKey.split('-');
        const kolText = kolTurleri.find(k => k.value === kolTuru)?.label || kolTuru;
        const yakaText = yakaTurleri.find(y => y.value === yakaTuru)?.label || yakaTuru;
        return `${kolText} - ${yakaText}`;
      }
    }
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
                  <option value="3iplik">3 İplik</option>
                  <option value="polar">Polar</option>
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

            {formData.siparisTuru === '3iplik' ? (
              <div className="form-row">
                <div className="form-grup">
                  <label htmlFor="ucIplikModeli">Model</label>
                  <select
                    id="ucIplikModeli"
                    name="ucIplikModeli"
                    value={formData.ucIplikModeli}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="dik-yaka-mont">Dik Yaka Mont</option>
                    <option value="bisiklet-yaka-sivit">Bisiklet Yaka Sivit</option>
                    <option value="kapusonlu-sivit">Kapüşonlu Sivit</option>
                    <option value="kisa-fermuarli-sivit">Kısa Fermuarlı Sivit</option>
                    <option value="kapusonlu-mont">Kapüşonlu Mont</option>
                    <option value="polo-yaka-sivit">Polo Yaka Sivit</option>
                  </select>
                </div>
                <div className="form-grup">
                  {/* Boş alan */}
                </div>
              </div>
            ) : formData.siparisTuru === 'polar' ? (
              <div className="form-row">
                <div className="form-grup">
                  <label htmlFor="polarModeli">Model</label>
                  <select
                    id="polarModeli"
                    name="polarModeli"
                    value={formData.polarModeli}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="dik-yaka-mont">Dik Yaka Mont</option>
                    <option value="kisa-fermuarli-sivit">Kısa Fermuarlı Sivit</option>
                    <option value="kapusonlu-mont">Kapüşonlu Mont</option>
                    <option value="sal-70cm">Şal 70 cm</option>
                    <option value="sal-90cm">Şal 90 cm</option>
                  </select>
                </div>
              </div>
            ) : (
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
            )}

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
          <div className="kombinasyon-header">
            <h2>Mevcut Kombinasyonlar ({urunKombinasyonlari.length})</h2>
            {urunKombinasyonlari.length > 0 && (
              <button 
                className="tumunu-toggle-btn"
                onClick={tumunuToggle}
              >
                {Object.values(acikGruplar).every(Boolean) ? 'Tümünü Kapat' : 'Tümünü Aç'}
              </button>
            )}
          </div>
          
          {urunKombinasyonlari.length === 0 ? (
            <div className="bos-liste">
              <p>Henüz kombinasyon eklenmemiş.</p>
            </div>
          ) : (
            <div className="kombinasyon-gruplari">
              {['suprem', 'lakost', 'yagmurdesen', '3iplik', 'polar'].map(siparisTuru => {
                const kombinasyonlar = urunKombinasyonlari.filter(k => k.siparisTuru === siparisTuru);
                
                if (kombinasyonlar.length === 0) return null;
                
                return (
                  <div key={siparisTuru} className="siparis-grubu">
                    <div 
                      className="grup-baslik"
                      onClick={() => toggleGrup(siparisTuru)}
                    >
                      <h3>
                        {siparisTuru === 'suprem' ? 'Süprem' : 
                         siparisTuru === 'lakost' ? 'Lakost' : 
                         siparisTuru === 'yagmurdesen' ? 'Yağmurdesen' : 
                         siparisTuru === '3iplik' ? '3 İplik' : 'Polar'} 
                        ({kombinasyonlar.length})
                      </h3>
                      <div className={`toggle-icon ${acikGruplar[siparisTuru] ? 'acik' : 'kapali'}`}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                        </svg>
                      </div>
                    </div>
                    
                    {acikGruplar[siparisTuru] && (
                      <div className="alt-gruplar">
                        {Object.entries(getAltGruplar(kombinasyonlar, siparisTuru)).map(([altGrupKey, altKombinasyonlar]) => {
                          const fullGrupKey = `${siparisTuru}-${altGrupKey}`;
                          
                          return (
                            <div key={altGrupKey} className="alt-grup">
                              <div 
                                className="alt-grup-baslik"
                                onClick={() => toggleAltGrup(fullGrupKey)}
                              >
                                <h4>
                                  {getAltGrupBaslik(altGrupKey, siparisTuru)} ({altKombinasyonlar.length})
                                </h4>
                                <div className={`toggle-icon ${acikAltGruplar[fullGrupKey] ? 'acik' : 'kapali'}`}>
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                                  </svg>
                                </div>
                              </div>
                              
                              {acikAltGruplar[fullGrupKey] && (
                                <div className="kombinasyon-grid">
                                  {altKombinasyonlar.map(kombinasyon => (
                                    <div key={kombinasyon.id} className="kombinasyon-kart">
                                      <div className="kombinasyon-gorsel">
                                        <img src={kombinasyon.gorsel} alt={kombinasyon.isim} />
                                      </div>
                                      <div className="kombinasyon-bilgi">
                                        <h5>{kombinasyon.isim}</h5>
                                        <div className="kombinasyon-detaylar">
                                          <p><strong>Renk:</strong> {getRenkIsmi(kombinasyon.renkId)}</p>
                                          {siparisTuru === '3iplik' ? (
                                            <p><strong>Model:</strong> {
                                              kombinasyon.ucIplikModeli === 'dik-yaka-mont' ? 'Dik Yaka Mont' :
                                              kombinasyon.ucIplikModeli === 'bisiklet-yaka-sivit' ? 'Bisiklet Yaka Sivit' :
                                              kombinasyon.ucIplikModeli === 'kapusonlu-sivit' ? 'Kapüşonlu Sivit' :
                                              kombinasyon.ucIplikModeli === 'kisa-fermuarli-sivit' ? 'Kısa Fermuarlı Sivit' :
                                              kombinasyon.ucIplikModeli === 'kapusonlu-mont' ? 'Kapüşonlu Mont' :
                                              kombinasyon.ucIplikModeli === 'polo-yaka-sivit' ? 'Polo Yaka Sivit' : kombinasyon.ucIplikModeli
                                            }</p>
                                          ) : siparisTuru === 'polar' ? (
                                            <p><strong>Model:</strong> {
                                              kombinasyon.polarModeli === 'dik-yaka-mont' ? 'Dik Yaka Mont' :
                                              kombinasyon.polarModeli === 'kisa-fermuarli-sivit' ? 'Kısa Fermuarlı Sivit' :
                                              kombinasyon.polarModeli === 'kapusonlu-mont' ? 'Kapüşonlu Mont' :
                                              kombinasyon.polarModeli === 'sal-70cm' ? 'Şal 70 cm' :
                                              kombinasyon.polarModeli === 'sal-90cm' ? 'Şal 90 cm' : kombinasyon.polarModeli
                                            }</p>
                                          ) : (
                                            <>
                                              <p><strong>Kol:</strong> {kolTurleri.find(k => k.value === kombinasyon.kolTuru)?.label}</p>
                                              <p><strong>Yaka:</strong> {yakaTurleri.find(y => y.value === kombinasyon.yakaTuru)?.label}</p>
                                            </>
                                          )}
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
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GorsellerSayfasi; 