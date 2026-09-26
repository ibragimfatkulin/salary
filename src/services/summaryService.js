import { getIncomes } from './incomeService';
import { getExpenses } from './expenseService';

/**
 * Получить общую сумму доходов
 * @returns {number} сумма всех доходов
 */
export const getTotalIncome = () => {
  const incomes = getIncomes();
  return incomes.reduce((sum, income) => sum + (income.amount || 0), 0);
};

/**
 * Получить общую сумму расходов
 * @returns {number} сумма всех расходов
 */
export const getTotalExpense = () => {
  const expenses = getExpenses();
  return expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
};

/**
 * Получить общий баланс (доходы - расходы)
 * @returns {number} баланс
 */
export const getBalance = () => {
  return getTotalIncome() - getTotalExpense();
};

/**
 * Получить данные по категориям для круговой диаграммы
 * @param {string} type - тип операции ('income' или 'expense')
 * @returns {Array} массив объектов { name, value, color } для recharts
 */
export const getByCategory = (type = 'expense') => {
  const items = type === 'income' ? getIncomes() : getExpenses();
  
  // Группировка по категориям
  const categoryMap = {};
  items.forEach(item => {
    const categoryId = item.categoryId || 'other';
    const categoryLabel = item.categoryLabel || 'Без категории';
    
    if (!categoryMap[categoryId]) {
      categoryMap[categoryId] = {
        name: categoryLabel,
        value: 0,
        categoryId
      };
    }
    
    categoryMap[categoryId].value += item.amount || 0;
  });
  
  // Палитра цветов для категорий
  const colors = [
    '#2563eb', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
  ];
  
  // Преобразование в массив для recharts
  return Object.values(categoryMap).map((item, index) => ({
    ...item,
    color: colors[index % colors.length]
  }));
};

/**
 * Получить помесячную статистику для столбчатого графика
 * @param {number} months - количество месяцев назад (по умолчанию 6)
 * @returns {Array} массив объектов { month, income, expense } для recharts
 */
export const getMonthlySummary = (months = 6) => {
  const incomes = getIncomes();
  const expenses = getExpenses();
  
  const now = new Date();
  const result = [];
  
  // Генерация последних N месяцев
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const monthLabel = new Intl.DateTimeFormat('ru-RU', {
      month: 'short'
    }).format(date);
    
    // Сумма доходов за месяц
    const monthIncome = incomes
      .filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate.getFullYear() === year && incomeDate.getMonth() === month;
      })
      .reduce((sum, income) => sum + (income.amount || 0), 0);
    
    // Сумма расходов за месяц
    const monthExpense = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
      })
      .reduce((sum, expense) => sum + (expense.amount || 0), 0);
    
    result.push({
      month: monthLabel,
      income: monthIncome,
      expense: monthExpense
    });
  }
  
  return result;
};

/**
 * Получить последние операции (доходы + расходы, отсортированные по дате)
 * @param {number} limit - количество операций (по умолчанию 10)
 * @returns {Array} массив последних операций
 */
export const getRecentTransactions = (limit = 10) => {
  const incomes = getIncomes();
  const expenses = getExpenses();
  
  // Объединение и сортировка по дате (новые первыми)
  const allTransactions = [...incomes, ...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return allTransactions.slice(0, limit);
};