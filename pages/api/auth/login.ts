import { NextApiRequest, NextApiResponse } from 'next';

// Sabit kullanıcı bilgileri
const USERS = [
  {
    username: 'blawlers',
    password: 'mstfks97'
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Kullanıcı adı ve şifre gerekli' });
  }

  // Kullanıcı doğrulama
  const user = USERS.find(u => u.username === username && u.password === password);

  if (user) {
    // Şifreyi response'a dahil etme
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({ 
      message: 'Giriş başarılı',
      user: userWithoutPassword
    });
  } else {
    res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
  }
} 