import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const MusterilerSayfasi: React.FC = () => {
  const { musteriler, musteriEkle, musteriSil, musteriSirala } = useAppContext();
  const [yeniMusteriIsmi, setYeniMusteriIsmi] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (yeniMusteriIsmi.trim()) {
      await musteriEkle({ isim: yeniMusteriIsmi.trim() });
      setYeniMusteriIsmi('');
      setShowForm(false);
    }
  };

  const handleSil = async (id: string, isim: string) => {
    if (window.confirm(`"${isim}" müşterisini silmek istediğinizden emin misiniz?`)) {
      await musteriSil(id);
    }
  };

  const handleDragStart = (e: React.DragEvent, musteriId: string) => {
    setDraggedItem(musteriId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetMusteriId: string) => {
    e.preventDefault();
    
    if (draggedItem && draggedItem !== targetMusteriId) {
      const draggedMusteri = musteriler.find(m => m.id === draggedItem);
      const targetMusteri = musteriler.find(m => m.id === targetMusteriId);
      
      if (draggedMusteri && targetMusteri) {
        musteriSirala(draggedItem, targetMusteri.sira);
      }
    }
    
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="musteriler-sayfasi">
      <div className="sayfa-header">
        <h1>Müşteri Yönetimi</h1>
        <button 
          className="yeni-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'İptal' : '+ Yeni Müşteri'}
        </button>
      </div>

      {showForm && (
        <div className="yeni-musteri-form">
          <form onSubmit={handleSubmit}>
            <div className="form-grup">
              <label htmlFor="musteriIsmi">Müşteri İsmi</label>
              <input
                type="text"
                id="musteriIsmi"
                value={yeniMusteriIsmi}
                onChange={(e) => setYeniMusteriIsmi(e.target.value)}
                placeholder="Müşteri ismini giriniz"
                required
                autoFocus
              />
            </div>
            <div className="form-actions">
              <button type="button" onClick={() => setShowForm(false)} className="iptal-btn">
                İptal
              </button>
              <button type="submit" className="kaydet-btn">
                Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="musteriler-listesi">
        {musteriler.length === 0 ? (
          <div className="bos-liste">
            <p>Henüz müşteri bulunmuyor.</p>
            <p>Yeni müşteri eklemek için yukarıdaki "Yeni Müşteri" butonunu kullanın.</p>
          </div>
        ) : (
          <div className="musteri-liste">
            {musteriler.map((musteri, index) => (
              <div 
                key={musteri.id} 
                className={`musteri-kart ${draggedItem === musteri.id ? 'dragging' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, musteri.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, musteri.id)}
                onDragEnd={handleDragEnd}
              >
                <div className="drag-handle">
                  <span>⋮⋮</span>
                </div>
                <div className="musteri-sira">
                  {index + 1}
                </div>
                <div className="musteri-bilgi">
                  <h3>{musteri.isim}</h3>
                </div>
                <div className="musteri-actions">
                  <button
                    className="sil-btn"
                    onClick={() => handleSil(musteri.id, musteri.isim)}
                    title="Müşteriyi sil"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sayfa-footer">
        <p>Toplam {musteriler.length} müşteri</p>
      </div>
    </div>
  );
};

export default MusterilerSayfasi;
