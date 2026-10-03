import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getIncomes,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome
} from '../controllers/incomeController.js';

const router = Router();

// Все маршруты защищены middleware authenticateToken
// req.user будет доступен во всех контроллерах

/**
 * @route   GET /api/v1/incomes
 * @desc    Получить список доходов текущего пользователя
 * @access  Private
 */
router.get('/', authenticateToken, getIncomes);

/**
 * @route   GET /api/v1/incomes/:id
 * @desc    Получить один доход по ID
 * @access  Private
 */
router.get('/:id', authenticateToken, getIncomeById);

/**
 * @route   POST /api/v1/incomes
 * @desc    Создать новый доход
 * @access  Private
 */
router.post('/', authenticateToken, createIncome);

/**
 * @route   PUT /api/v1/incomes/:id
 * @desc    Обновить доход
 * @access  Private
 */
router.put('/:id', authenticateToken, updateIncome);

/**
 * @route   DELETE /api/v1/incomes/:id
 * @desc    Удалить доход
 * @access  Private
 */
router.delete('/:id', authenticateToken, deleteIncome);

export default router;