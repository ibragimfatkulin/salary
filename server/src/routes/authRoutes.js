import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Регистрация нового пользователя
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Вход пользователя (получение токена)
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Получение данных текущего авторизованного пользователя
 * @access  Private (требует токен)
 */
router.get('/me', authenticateToken, getMe);

export default router;