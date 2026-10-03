import { getDb } from '../db/connection.js';
import crypto from 'crypto';

/**
 * Получить список доходов текущего пользователя
 * GET /api/v1/incomes
 */
export async function getIncomes(req, res, next) {
  try {
    const db = getDb();
    const userId = req.user.id; // <-- Получаем ID текущего пользователя из middleware
    
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    // Получаем доходы только текущего пользователя
    const incomes = await db.all(
      `SELECT * FROM incomes 
       WHERE user_id = ? 
       ORDER BY date DESC, created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // Получаем общее количество доходов пользователя
    const { total } = await db.get(
      'SELECT COUNT(*) as total FROM incomes WHERE user_id = ?',
      [userId]
    );

    return res.json({
      data: incomes,
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
 * Получить один доход по ID (только если он принадлежит текущему пользователю)
 * GET /api/v1/incomes/:id
 */
export async function getIncomeById(req, res, next) {
  try {
    const db = getDb();
    const userId = req.user.id;
    const { id } = req.params;

    const income = await db.get(
      'SELECT * FROM incomes WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!income) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Доход не найден или не принадлежит вам'
        }
      });
    }

    return res.json({ data: income });
  } catch (error) {
    next(error);
  }
}

/**
 * Создать новый доход
 * POST /api/v1/incomes
 */
export async function createIncome(req, res, next) {
  try {
    const db = getDb();
    const userId = req.user.id; // <-- Привязываем доход к текущему пользователю
    
    const { amount, date, category, comment, is_recurring, recurring_period, recurring_end_date } = req.body;

    // Валидация
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
      `INSERT INTO incomes 
       (id, user_id, amount, date, category, comment, is_recurring, recurring_period, recurring_end_date, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, amount, date, category, comment || null, is_recurring ? 1 : 0, recurring_period || null, recurring_end_date || null, now, now]
    );

    const income = await db.get('SELECT * FROM incomes WHERE id = ?', [id]);

    return res.status(201).json({ data: income });
  } catch (error) {
    next(error);
  }
}

/**
 * Обновить доход (только если он принадлежит текущему пользователю)
 * PUT /api/v1/incomes/:id
 */
export async function updateIncome(req, res, next) {
  try {
    const db = getDb();
    const userId = req.user.id;
    const { id } = req.params;

    // Проверяем, что доход существует и принадлежит пользователю
    const existingIncome = await db.get(
      'SELECT * FROM incomes WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!existingIncome) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Доход не найден или не принадлежит вам'
        }
      });
    }

    const { amount, date, category, comment, is_recurring, recurring_period, recurring_end_date } = req.body;
    const now = new Date().toISOString();

    await db.run(
      `UPDATE incomes 
       SET amount = ?, date = ?, category = ?, comment = ?, is_recurring = ?, recurring_period = ?, recurring_end_date = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
      [amount || existingIncome.amount, date || existingIncome.date, category || existingIncome.category, 
       comment !== undefined ? comment : existingIncome.comment, 
       is_recurring !== undefined ? (is_recurring ? 1 : 0) : existingIncome.is_recurring,
       recurring_period || existingIncome.recurring_period, 
       recurring_end_date || existingIncome.recurring_end_date, 
       now, id, userId]
    );

    const updatedIncome = await db.get('SELECT * FROM incomes WHERE id = ?', [id]);

    return res.json({ data: updatedIncome });
  } catch (error) {
    next(error);
  }
}

/**
 * Удалить доход (только если он принадлежит текущему пользователю)
 * DELETE /api/v1/incomes/:id
 */
export async function deleteIncome(req, res, next) {
  try {
    const db = getDb();
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.run(
      'DELETE FROM incomes WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Доход не найден или не принадлежит вам'
        }
      });
    }

    return res.json({ message: 'Доход успешно удален' });
  } catch (error) {
    next(error);
  }
}