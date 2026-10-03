import { registerUser, loginUser, getUserById } from '../services/userService.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';

/**
 * Регистрация нового пользователя
 * POST /api/v1/auth/register
 */
export async function register(req, res) {
  try {
    const { email, password } = req.body;

    // Валидация входных данных
    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email и пароль обязательны для заполнения'
        }
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Пароль должен содержать минимум 6 символов'
        }
      });
    }

    // Регистрируем пользователя
    const user = await registerUser({ email, password });

    // Генерируем токен сразу после регистрации
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      data: {
        user: { id: user.id, email: user.email },
        token
      }
    });
  } catch (error) {
    if (error.message.includes('уже существует')) {
      return res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: error.message
        }
      });
    }
    console.error('Ошибка регистрации:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Произошла ошибка при регистрации'
      }
    });
  }
}

/**
 * Вход пользователя
 * POST /api/v1/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email и пароль обязательны для заполнения'
        }
      });
    }

    const result = await loginUser({ email, password });

    return res.status(200).json({
      data: result
    });
  } catch (error) {
    if (error.message.includes('Неверный')) {
      return res.status(401).json({
        error: {
          code: 'AUTH_ERROR',
          message: error.message
        }
      });
    }
    console.error('Ошибка входа:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Произошла ошибка при входе'
      }
    });
  }
}

/**
 * Получить данные текущего пользователя
 * GET /api/v1/auth/me
 */
export async function getMe(req, res) {
  try {
    // req.user добавлен middleware authenticateToken
    const user = await getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Пользователь не найден'
        }
      });
    }

    return res.status(200).json({
      data: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Произошла ошибка при получении профиля'
      }
    });
  }
}