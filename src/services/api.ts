import axios from 'axios';
import { Musteri, Renk, Siparis, UrunKombinasyonu } from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app.vercel.app/api' 
  : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Müşteri API'leri
export const musteriAPI = {
  getAll: async (): Promise<Musteri[]> => {
    const response = await api.get('/musteriler');
    return response.data;
  },
  
  create: async (musteri: Omit<Musteri, 'id' | 'sira'>): Promise<Musteri> => {
    const response = await api.post('/musteriler', musteri);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/musteriler/${id}`);
  },
  
  updateOrder: async (id: string, newOrder: number): Promise<void> => {
    await api.put(`/musteriler/${id}/order`, { sira: newOrder });
  }
};

// Renk API'leri
export const renkAPI = {
  getAll: async (): Promise<Renk[]> => {
    const response = await api.get('/renkler');
    return response.data;
  },
  
  create: async (renk: Omit<Renk, 'id' | 'sira'>): Promise<Renk> => {
    const response = await api.post('/renkler', renk);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/renkler/${id}`);
  },
  
  updateOrder: async (id: string, newOrder: number): Promise<void> => {
    await api.put(`/renkler/${id}/order`, { sira: newOrder });
  }
};

// Kombinasyon API'leri
export const kombinasyonAPI = {
  getAll: async (): Promise<UrunKombinasyonu[]> => {
    const response = await api.get('/kombinasyonlar');
    return response.data;
  },
  
  create: async (kombinasyon: Omit<UrunKombinasyonu, 'id'>, file: File): Promise<UrunKombinasyonu> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('data', JSON.stringify(kombinasyon));
    
    const response = await api.post('/kombinasyonlar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/kombinasyonlar/${id}`);
  }
};

// Sipariş API'leri
export const siparisAPI = {
  getAll: async (): Promise<Siparis[]> => {
    const response = await api.get('/siparisler');
    return response.data;
  },
  
  create: async (siparis: Omit<Siparis, 'id' | 'siparisNo' | 'tarih' | 'durum' | 'toplamUrun' | 'kombinasyonGorsel'>): Promise<Siparis> => {
    const response = await api.post('/siparisler', siparis);
    return response.data;
  },
  
  updateStatus: async (id: string, durum: 'beklemede' | 'tamamlandi' | 'iptal'): Promise<void> => {
    await api.put(`/siparisler/${id}/status`, { durum });
  }
};

export default api; 