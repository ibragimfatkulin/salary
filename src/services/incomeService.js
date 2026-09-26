import { getFromStorage, setToStorage, generateId } from './storage';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Получить все доходы
 * @returns {Array} массив доходов
 */
export const getIncomes = () => {
  return getFromStorage(STORAGE_KEYS.INCOMES, []);
};

/**
 * Получить доход по ID
 * @param {string} id - идентификатор дохода
 * @returns {Object|null} объект дохода или null
 */
export const getIncomeById = (id) => {
  const incomes = getIncomes();
  return incomes.find(income => income.id === id) || null;
};

/**
 * Добавить новый доход
 * @param {Object} incomeData - данные дохода (categoryId, amount, date, comment)
 * @returns {Object} созданный доход с id и timestamp
 */
export const addIncome = (incomeData) => {
  const incomes = getIncomes();
  
  const newIncome = {
    id: generateId(),
    type: 'income',
    categoryId: incomeData.categoryId,
    categoryLabel: incomeData.categoryLabel || 'Без категории',
    amount: parseFloat(incomeData.amount) || 0,
    date: incomeData.date || new Date().toISOString().split('T')[0],
    comment: incomeData.comment || '',
    createdAt: new Date().toISOString()
  };
  
  incomes.push(newIncome);
  setToStorage(STORAGE_KEYS.INCOMES, incomes);
  
  return newIncome;
};

/**
 * Обновить существующий доход
 * @param {string} id - идентификатор дохода
 * @param {Object} incomeData - новые данные дохода
 * @returns {Object|null} обновлённый доход или null если не найден
 */
export const updateIncome = (id, incomeData) => {
  const incomes = getIncomes();
  const index = incomes.findIndex(income => income.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedIncome = {
    ...incomes[index],
    categoryId: incomeData.categoryId ?? incomes[index].categoryId,
    categoryLabel: incomeData.categoryLabel ?? incomes[index].categoryLabel,
    amount: incomeData.amount !== undefined 
      ? parseFloat(incomeData.amount) 
      : incomes[index].amount,
    date: incomeData.date ?? incomes[index].date,
    comment: incomeData.comment ?? incomes[index].comment,
    updatedAt: new Date().toISOString()
  };
  
  incomes[index] = updatedIncome;
  setToStorage(STORAGE_KEYS.INCOMES, incomes);
  
  return updatedIncome;
};

/**
 * Удалить доход
 * @param {string} id - идентификатор дохода
 * @returns {boolean} true если удалён, false если не найден
 */
export const deleteIncome = (id) => {
  const incomes = getIncomes();
  const filteredIncomes = incomes.filter(income => income.id !== id);
  
  if (filteredIncomes.length === incomes.length) {
    return false; // Не найден
  }
  
  setToStorage(STORAGE_KEYS.INCOMES, filteredIncomes);
  return true;
};