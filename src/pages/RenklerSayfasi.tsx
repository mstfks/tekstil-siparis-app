import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const RenklerSayfasi: React.FC = () => {
  const { renkler, renkEkle, renkSil, renkSirala } = useAppContext();
  const [yeniRenkIsmi, setYeniRenkIsmi] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (yeniRenkIsmi.trim()) {
      await renkEkle({
        isim: yeniRenkIsmi.trim(),
        kod: '#000000' // Default renk kodu
      });
      setYeniRenkIsmi('');
      setShowForm(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, renkId: string) => {
    setDraggedItem(renkId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', renkId);
  };

  const handleDragOver = (e: React.DragEvent, renkId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedItem && draggedItem !== renkId) {
      setDragOverItem(renkId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Sadece ana element'ten çıkıldığında drag-over'ı temizle
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverItem(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetRenkId: string) => {
    e.preventDefault();
    setDragOverItem(null);
    
    if (draggedItem && draggedItem !== targetRenkId) {
      const draggedRenk = renkler.find(r => r.id === draggedItem);
      const targetRenk = renkler.find(r => r.id === targetRenkId);
      
      if (draggedRenk && targetRenk) {
        await renkSirala(draggedItem, targetRenk.sira);
      }
    }
    
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleSil = async (id: string, isim: string) => {
    if (window.confirm(`"${isim}" rengini silmek istediğinizden emin misiniz?`)) {
      await renkSil(id);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYeniRenkIsmi(e.target.value);
  };

  return (
    <div className="renkler-sayfasi">
      <div className="sayfa-header">
        <h1>Renk Yönetimi</h1>
        <button 
          className="yeni-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'İptal' : '+ Yeni Renk'}
        </button>
      </div>

      {showForm && (
        <div className="yeni-renk-form">
          <form onSubmit={handleSubmit}>
            <div className="form-grup">
              <label htmlFor="renkIsmi">Renk İsmi</label>
              <input
                type="text"
                id="renkIsmi"
                name="isim"
                value={yeniRenkIsmi}
                onChange={handleInputChange}
                placeholder="Renk ismini giriniz"
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

      <div className="renkler-listesi">
        {renkler.length === 0 ? (
          <div className="bos-liste">
            <p>Henüz renk bulunmuyor.</p>
            <p>Yeni renk eklemek için yukarıdaki "Yeni Renk" butonunu kullanın.</p>
          </div>
        ) : (
          <div className="renk-liste">
            {renkler.map((renk, index) => (
              <div 
                key={renk.id} 
                className={`renk-kart ${
                  draggedItem === renk.id ? 'dragging' : ''
                } ${
                  dragOverItem === renk.id ? 'drag-over' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, renk.id)}
                onDragOver={(e) => handleDragOver(e, renk.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, renk.id)}
                onDragEnd={handleDragEnd}
              >
                <div className="drag-handle">
                  <span>⋮⋮</span>
                </div>
                <div className="renk-bilgi">
                  <h3>{renk.isim}</h3>
                </div>
                <div className="renk-actions">
                  <button
                    className="sil-btn"
                    onClick={() => handleSil(renk.id, renk.isim)}
                    title="Rengi sil"
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
        <div className="toplam-renk-container">
          <div className="cizgi-sol"></div>
          <div className="toplam-renk-badge">
            <span className="toplam-icon">🎨</span>
            <span className="toplam-text">Toplam {renkler.length} Renk</span>
          </div>
          <div className="cizgi-sag"></div>
        </div>
      </div>
    </div>
  );
};

export default RenklerSayfasi; 