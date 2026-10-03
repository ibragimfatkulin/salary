import { getDb } from '../db/connection.js';
import crypto from 'crypto';

/**
 * Получить список расходов текущего пользователя
 * GET /api/v1/expenses
 */
export async function getExpenses(req, res, next) {
  try {
    const db = getDb();
    const userId = req.user.id;
    
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const expenses = await db.all(
      `SELECT * FROM expenses 
       WHERE user_id = ? 
       ORDER BY date DESC, created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    const { total } = await db.get(
      'SELECT COUNT(*) as total FROM expenses WHERE user_id = ?',
      [userId]
    );

    return res.json({
      data: expenses,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Получить один расход по ID
 * GET /api/v1/expenses/:id
 */
export async function getExpenseById(req, res, next) {
  try {
    const db = getDb();
    const userId = req.user.id;
    const { id } = req.params;

    const expense = await db.get(
      'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!expense) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Расход не найден или не принадлежит вам'
        }
      });
    }

    return res.json({ data: expense });
  } catch (error) {
    next(error);
  }
}

/**
 * Создать новый расход
 * POST /api/v1/expenses
 */
export async function createExpense(req, res, next) {
  try {
    const db = getDb();
    const userId = req.user.id;
    
    const { amount, date, category, comment, is_recurring, recurring_period, recurring_end_date } = req.body;

    if (!amount || !date || !category) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Поля amount, date и category обязательны'
        }
      });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO expenses 
       (id, user_id, amount, date, category, comment, is_recurring, recurring_period, recurring_end_date, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, amount, date, category, comment || null, is_recurring ? 1 : 0, recurring_period || null, recurring_end_date || null, now, now]
    );

    const expense = await db.get('SELECT * FROM expenses WHERE id = ?', [id]);

    return res.status(201).json({ data: expense });
  } catch (error) {
    next(error);
  }
}

/**
 * Обновить расход
 * PUT /api/v1/expenses/:id
 */
export async function updateExpense(req, res, next) {
  try {
    const db = getDb();
    const userId = req.user.id;
    const { id } = req.params;

    const existingExpense = await db.get(
      'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!existingExpense) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Расход не найден или не принадлежит вам'
        }
      });
    }

    const { amount, date, category, comment, is_recurring, recurring_period, recurring_end_date } = req.body;
    const now = new Date().toISOString();

    await db.run(
      `UPDATE expenses 
       SET amount = ?, date = ?, category = ?, comment = ?, is_recurring = ?, recurring_period = ?, recurring_end_date = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
      [amount || existingExpense.amount, date || existingExpense.date, category || existingExpense.category, 
       comment !== undefined ? comment : existingExpense.comment, 
       is_recurring !== undefined ? (is_recurring ? 1 : 0) : existingExpense.is_recurring,
       recurring_period || existingExpense.recurring_period, 
       recurring_end_date || existingExpense.recurring_end_date, 
       now, id, userId]
    );

    const updatedExpense = await db.get('SELECT * FROM expenses WHERE id = ?', [id]);

    return res.json({ data: updatedExpense });
  } catch (error) {
    next(error);
  }
}

/**
 * Удалить расход
 * DELETE /api/v1/expenses/:id
 */
export async function deleteExpense(req, res, next) {
  try {
    const db = getDb();
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.run(
      'DELETE FROM expenses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Расход не найден или не принадлежит вам'
        }
      });
    }

    return res.json({ message: 'Расход успешно удален' });
  } catch (error) {
    next(error);
  }
}