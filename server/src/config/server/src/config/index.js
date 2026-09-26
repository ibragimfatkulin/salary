// server/src/config/index.js

// Порт, на котором будет работать сервер
export const PORT = process.env.PORT || 3001;

// Путь к файлу базы данных SQLite.
// better-sqlite3 создаст этот файл автоматически при первом запуске.
// Файл будет лежать в корне папки server/
export const DB_PATH = process.env.DB_PATH || 'salary-tracker.db';

// Настройки CORS (Cross-Origin Resource Sharing).
// Разрешаем запросы только с адреса нашего фронтенда (Vite по умолчанию на 5173)
export const CORS_OPTIONS = {
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};