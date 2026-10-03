import { getDb } from '../db/connection.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';

/**
 * Регистрация нового пользователя
 */
export async function registerUser({ email, password }) {
  const db = getDb();
  
  // Проверяем, существует ли пользователь с таким email
  const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (existingUser) {
    throw new Error('Пользователь с таким email уже существует');
  }

  // Хешируем пароль
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Создаем пользователя в базе
  await db.run(
    'INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [id, email.toLowerCase(), passwordHash, now, now]
  );

  return { id, email: email.toLowerCase(), createdAt: now };
}

/**
 * Вход пользователя (аутентификация)
 */
export async function loginUser({ email, password }) {
  const db = getDb();
  
  // Ищем пользователя по email
  const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  if (!user) {
    throw new Error('Неверный email или пароль');
  }

  // Проверяем пароль
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Неверный email или пароль');
  }

  // Генерируем JWT токен
  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    user: { id: user.id, email: user.email },
    token
  };
}

/**
 * Получить пользователя по ID
 */
export async function getUserById(id) {
  const db = getDb();
  return await db.get('SELECT id, email, created_at FROM users WHERE id = ?', [id]);
}