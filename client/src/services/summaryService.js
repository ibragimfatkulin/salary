import * as api from './api.js';
import { getIncomes } from './incomeService.js';
import { getExpenses } from './expenseService.js';

export async function getBalance() {
  try {
    const response = await api.get('/summary/balance');
    return response.data || response;
  } catch (error) {
    console.error('Ошибка получения баланса:', error);
    throw error;
  }
}

export async function getAllTransactions(limit = null) {
  try {
    const [incomesResponse, expensesResponse] = await Promise.all([
      getIncomes({ limit: limit || 1000 }),
      getExpenses({ limit: limit || 1000 }),
    ]);

    const incomes = (incomesResponse.data || []).map(t => ({ ...t, type: 'income' }));
    const expenses = (expensesResponse.data || []).map(t => ({ ...t, type: 'expense' }));

    const allTransactions = [...incomes, ...expenses];
    
    // Исходная сортировка по дате
    allTransactions.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0);
      const dateB = new Date(b.date || b.createdAt || 0);
      return dateB - dateA;
    });

    if (limit && limit > 0) {
      return allTransactions.slice(0, limit);
    }

    return allTransactions;
  } catch (error) {
    console.error('Ошибка получения всех операций:', error);
    throw error;
  }
}

export async function getByCategory(type = 'expense', period = 'all') {
  try {
    const params = { type };
    if (period !== 'all') {
      const { dateFrom, dateTo } = getPeriodDates(period);
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
    }
    const response = await api.get('/summary/by-category', params);
    return response.data || response;
  } catch (error) {
    console.error('Ошибка получения данных по категориям:', error);
    throw error;
  }
}

export async function getMonthlySummary(monthsCount = 6) {
  try {
    const response = await api.get('/summary/by-month', { months: monthsCount });
    return response.data || response;
  } catch (error) {
    console.error('Ошибка получения помесячной статистики:', error);
    throw error;
  }
}

export async function getTransactionById(id) {
  try {
    try {
      const income = await api.get(`/incomes/${id}`);
      return income.data || income;
    } catch (e) {}
    try {
      const expense = await api.get(`/expenses/${id}`);
      return expense.data || expense;
    } catch (e) {
      return null;
    }
  } catch (error) {
    console.error('Ошибка получения операции по ID:', error);
    throw error;
  }
}

function getPeriodDates(period) {
  const now = new Date();
  let dateFrom = null;
  let dateTo = null;

  switch (period) {
    case 'today':
      dateFrom = now.toISOString().split('T')[0];
      dateTo = dateFrom;
      break;
    case 'week':
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFrom = weekAgo.toISOString().split('T')[0];
      dateTo = now.toISOString().split('T')[0];
      break;
    case 'month':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFrom = startOfMonth.toISOString().split('T')[0];
      dateTo = now.toISOString().split('T')[0];
      break;
    case 'year':
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      dateFrom = startOfYear.toISOString().split('T')[0];
      dateTo = now.toISOString().split('T')[0];
      break;
    default:
      break;
  }
  return { dateFrom, dateTo };
}