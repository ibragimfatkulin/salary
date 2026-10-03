import { getDb } from '../db/connection.js';

/**
 * Получить баланс текущего пользователя
 * GET /api/v1/summary/balance
 */
export async function getBalance(req, res, next) {
  try {
    const db = getDb();
    const userId = req.user.id;

    // Получаем общую сумму доходов пользователя
    const incomeResult = await db.get(
      'SELECT COALESCE(SUM(amount), 0) as total FROM incomes WHERE user_id = ?',
      [userId]
    );

    // Получаем общую сумму расходов пользователя
    const expenseResult = await db.get(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ?',
      [userId]
    );

    const totalIncome = incomeResult.total;
    const totalExpense = expenseResult.total;
    const balance = totalIncome - totalExpense;

    return res.json({
      data: {
        balance,
        totalIncome,
        totalExpense
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Получить сводную статистику за период
 * GET /api/v1/summary/statistics?period=month
 */
export async function getStatistics(req, res, next) {
  try {
    const db = getDb();
    const userId = req.user.id;
    const period = req.query.period || 'month';

    // Определяем дату начала периода
    const now = new Date();
    let startDate;

    if (period === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
    } else if (period === 'year') {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
    } else {
      // По умолчанию - месяц
      startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
    }

    // Получаем доходы за период
    const incomes = await db.all(
      `SELECT category, SUM(amount) as total 
       FROM incomes 
       WHERE user_id = ? AND date >= ? 
       GROUP BY category 
       ORDER BY total DESC`,
      [userId, startDate]
    );

    // Получаем расходы за период
    const expenses = await db.all(
      `SELECT category, SUM(amount) as total 
       FROM expenses 
       WHERE user_id = ? AND date >= ? 
       GROUP BY category 
       ORDER BY total DESC`,
      [userId, startDate]
    );

    // Считаем общие суммы
    const totalIncome = incomes.reduce((sum, item) => sum + item.total, 0);
    const totalExpense = expenses.reduce((sum, item) => sum + item.total, 0);

    return res.json({
      data: {
        period,
        startDate,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        incomesByCategory: incomes,
        expensesByCategory: expenses
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Получить последние операции (доходы и расходы вместе)
 * GET /api/v1/summary/transactions?limit=10
 */
export async function getRecentTransactions(req, res, next) {
  try {
    const db = getDb();
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    // Получаем последние доходы
    const recentIncomes = await db.all(
      `SELECT id, amount, date, category, comment, 'income' as type, created_at 
       FROM incomes 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, limit]
    );

    // Получаем последние расходы
    const recentExpenses = await db.all(
      `SELECT id, amount, date, category, comment, 'expense' as type, created_at 
       FROM expenses 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, limit]
    );

    // Объединяем и сортируем по дате создания
    const allTransactions = [...recentIncomes, ...recentExpenses]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);

    return res.json({
      data: allTransactions
    });
  } catch (error) {
    next(error);
  }
}