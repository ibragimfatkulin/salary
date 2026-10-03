// server/src/config/jwt.js

// Секретный ключ для подписи JWT токенов 
// (в реальном проекте его нужно хранить в .env файле)
export const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production-2024';

// Время жизни токена (7 дней)
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';