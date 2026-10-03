import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';

/**
 * Middleware для проверки авторизации пользователя.
 * Извлекает JWT из заголовка Authorization, проверяет его и добавляет пользователя в запрос.
 */
export function authenticateToken(req, res, next) {
  // Получаем токен из заголовка (формат: "Bearer <token>")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Токен авторизации не предоставлен. Пожалуйста, войдите в систему.'
      }
    });
  }

  try {
    // Проверяем и декодируем токен
    const user = jwt.verify(token, JWT_SECRET);
    
    // Добавляем данные пользователя (id, email) в объект запроса
    req.user = user;
    next(); // Передаем управление следующему middleware или контроллеру
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Срок действия токена истек. Пожалуйста, войдите в систему снова.'
        }
      });
    }
    
    return res.status(403).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Недействительный токен авторизации.'
      }
    });
  }
}