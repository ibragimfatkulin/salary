import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { DB_PATH } from '../config/index.js';

// Получаем путь к текущей директории (т.к. используем ES-модули)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Инициализируем базу данных (файл создастся автоматически, если его нет)
const db = new Database(DB_PATH);

// Включаем WAL-режим для лучшей производительности и поддержки параллельного чтения
db.pragma('journal_mode = WAL');

// Читаем SQL-скрипт схемы и выполняем его (создаст таблицы, если их ещё нет)
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

export default db;