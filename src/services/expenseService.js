import { getFromStorage, setToStorage, generateId } from './storage';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Получить все расходы
 * @returns {Array} массив расходов
 */
export const getExpenses = () => {
  return getFromStorage(STORAGE_KEYS.EXPENSES, []);
};

/**
 * Получить расход по ID
 * @param {string} id - идентификатор расхода
 * @returns {Object|null} объект расхода или null
 */
export const getExpenseById = (id) => {
  const expenses = getExpenses();
  return expenses.find(expense => expense.id === id) || null;
};

/**
 * Добавить новый расход
 * @param {Object} expenseData - данные расхода (categoryId, amount, date, comment)
 * @returns {Object} созданный расход с id и timestamp
 */
export const addExpense = (expenseData) => {
  const expenses = getExpenses();
  
  const newExpense = {
    id: generateId(),
    type: 'expense',
    categoryId: expenseData.categoryId,
    categoryLabel: expenseData.categoryLabel || 'Без категории',
    amount: parseFloat(expenseData.amount) || 0,
    date: expenseData.date || new Date().toISOString().split('T')[0],
    comment: expenseData.comment || '',
    createdAt: new Date().toISOString()
  };
  
  expenses.push(newExpense);
  setToStorage(STORAGE_KEYS.EXPENSES, expenses);
  
  return newExpense;
};

/**
 * Обновить существующий расход
 * @param {string} id - идентификатор расхода
 * @param {Object} expenseData - новые данные расхода
 * @returns {Object|null} обновлённый расход или null если не найден
 */
export const updateExpense = (id, expenseData) => {
  const expenses = getExpenses();
  const index = expenses.findIndex(expense => expense.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedExpense = {
    ...expenses[index],
    categoryId: expenseData.categoryId ?? expenses[index].categoryId,
    categoryLabel: expenseData.categoryLabel ?? expenses[index].categoryLabel,
    amount: expenseData.amount !== undefined 
      ? parseFloat(expenseData.amount) 
      : expenses[index].amount,
    date: expenseData.date ?? expenses[index].date,
    comment: expenseData.comment ?? expenses[index].comment,
    updatedAt: new Date().toISOString()
  };
  
  expenses[index] = updatedExpense;
  setToStorage(STORAGE_KEYS.EXPENSES, expenses);
  
  return updatedExpense;
};

/**
 * Удалить расход
 * @param {string} id - идентификатор расхода
 * @returns {boolean} true если удалён, false если не найден
 */
export const deleteExpense = (id) => {
  const expenses = getExpenses();
  const filteredExpenses = expenses.filter(expense => expense.id !== id);
  
  if (filteredExpenses.length === expenses.length) {
    return false; // Не найден
  }
  
  setToStorage(STORAGE_KEYS.EXPENSES, filteredExpenses);
  return true;
};