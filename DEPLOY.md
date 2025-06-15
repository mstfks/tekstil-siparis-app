# Tekstil Sipariş Uygulaması - Deploy Talimatları

## Gerekli Hesaplar

### 1. MongoDB Atlas
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) hesabı oluşturun
2. Yeni bir cluster oluşturun (ücretsiz tier yeterli)
3. Database user oluşturun
4. Network Access'te IP adresinizi ekleyin (0.0.0.0/0 herkese açık için)
5. Connection string'i kopyalayın

### 2. Cloudinary
1. [Cloudinary](https://cloudinary.com/) hesabı oluşturun
2. Dashboard'dan Cloud Name, API Key ve API Secret'i kopyalayın

## Vercel Deploy Adımları

### 1. GitHub'a Push
```bash
git add .
git commit -m "Deploy için hazırlık"
git push origin main
```

### 2. Vercel'e Deploy
1. [Vercel](https://vercel.com/) hesabı oluşturun
2. GitHub repository'nizi import edin
3. Environment Variables ekleyin:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tekstil-siparis?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Deploy
- Vercel otomatik olarak deploy edecek
- Deploy tamamlandığında URL'i alacaksınız

## Önemli Notlar

1. **Fotoğraflar**: Artık Cloudinary'de saklanacak
2. **Veriler**: MongoDB Atlas'ta saklanacak
3. **Güvenlik**: Environment variables Vercel dashboard'dan yönetilecek

## Test Etme

Deploy sonrası:
1. Müşteri ekleme/silme
2. Renk ekleme/silme
3. Fotoğraf yükleme
4. Sipariş oluşturma

işlemlerini test edin.

## Sorun Giderme

- Vercel Functions logs'unu kontrol edin
- MongoDB Atlas'ta connection'ları kontrol edin
- Cloudinary'de upload'ları kontrol edin 