import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import { DB_PATH } from '../config/index.js';

dotenv.config();

// Определяем URL подключения:
// Если задан TURSO_DATABASE_URL — подключаемся к облачной базе Turso
// Иначе — используем локальный файл базы данных SQLite
const url = process.env.TURSO_DATABASE_URL || `file:${DB_PATH.replace(/\\/g, '/')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
  url,
  authToken,
});

/**
 * Унифицированный объект БД с методами get, all, run, exec,
 * совместимый со старым sqlite API и работающий как с локальным SQLite, так и с Turso.
 */
const db = {
  /**
   * Получить одну запись (возвращает объект или undefined)
   */
  async get(sql, params = []) {
    const res = await client.execute({ sql, args: params });
    return res.rows[0] !== undefined ? res.rows[0] : undefined;
  },

  /**
   * Получить массив записей
   */
  async all(sql, params = []) {
    const res = await client.execute({ sql, args: params });
    return res.rows;
  },

  /**
   * Выполнить INSERT / UPDATE / DELETE
   * Возвращает { changes, lastID }
   */
  async run(sql, params = []) {
    const res = await client.execute({ sql, args: params });
    return {
      changes: res.rowsAffected,
      lastID: res.lastInsertRowid,
    };
  },

  /**
   * Выполнить пакет SQL-запросов (DDL схемы)
   */
  async exec(sql) {
    return await client.executeMultiple(sql);
  },

  /**
   * Прямой доступ к клиенту LibSQL
   */
  client,
};

let initialized = false;

/**
 * Инициализация таблиц базы данных (если они еще не созданы)
 */
export async function initializeDatabase() {
  if (initialized) return;

  try {
    await client.executeMultiple(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS incomes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount REAL NOT NULL CHECK(amount > 0),
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        comment TEXT,
        is_recurring INTEGER DEFAULT 0,
        recurring_period TEXT,
        recurring_end_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount REAL NOT NULL CHECK(amount > 0),
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        comment TEXT,
        is_recurring INTEGER DEFAULT 0,
        recurring_period TEXT,
        recurring_end_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON incomes(user_id);
      CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
      CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(date);
      CREATE INDEX IF NOT EXISTS idx_incomes_category ON incomes(category);
      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
      CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
    `);

    initialized = true;
    const dbType = process.env.TURSO_DATABASE_URL ? 'Turso Cloud' : 'Local SQLite';
    console.log(`✅ База данных (${dbType}) готова к работе`);
  } catch (error) {
    console.error('❌ Ошибка инициализации схемы базы данных:', error);
  }
}

// Запускаем инициализацию при старте модуля
initializeDatabase();

/**
 * Получение объекта базы данных
 * @returns {Object}
 */
export function getDb() {
  return db;
}

export default { getDb, initializeDatabase };