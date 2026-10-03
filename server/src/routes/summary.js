import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getBalance,
  getStatistics,
  getRecentTransactions
} from '../controllers/summaryController.js';

const router = Router();

/**
 * @route   GET /api/v1/summary/balance
 * @desc    Получить баланс текущего пользователя
 * @access  Private
 */
router.get('/balance', authenticateToken, getBalance);

/**
 * @route   GET /api/v1/summary/statistics
 * @desc    Получить статистику за период
 * @access  Private
 */
router.get('/statistics', authenticateToken, getStatistics);

/**
 * @route   GET /api/v1/summary/transactions
 * @desc    Получить последние операции
 * @access  Private
 */
router.get('/transactions', authenticateToken, getRecentTransactions);

export default router;