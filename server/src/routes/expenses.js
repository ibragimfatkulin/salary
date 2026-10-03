import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
} from '../controllers/expenseController.js';

const router = Router();

/**
 * @route   GET /api/v1/expenses
 * @desc    Получить список расходов текущего пользователя
 * @access  Private
 */
router.get('/', authenticateToken, getExpenses);

/**
 * @route   GET /api/v1/expenses/:id
 * @desc    Получить один расход по ID
 * @access  Private
 */
router.get('/:id', authenticateToken, getExpenseById);

/**
 * @route   POST /api/v1/expenses
 * @desc    Создать новый расход
 * @access  Private
 */
router.post('/', authenticateToken, createExpense);

/**
 * @route   PUT /api/v1/expenses/:id
 * @desc    Обновить расход
 * @access  Private
 */
router.put('/:id', authenticateToken, updateExpense);

/**
 * @route   DELETE /api/v1/expenses/:id
 * @desc    Удалить расход
 * @access  Private
 */
router.delete('/:id', authenticateToken, deleteExpense);

export default router;