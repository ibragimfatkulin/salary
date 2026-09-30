import * as api from './api.js';

export async function getExpenses(filters = {}) {
  try {
    const response = await api.get('/expenses', filters);
    return response;
  } catch (error) {
    console.error('Ошибка получения расходов:', error);
    throw error;
  }
}

export async function getExpenseById(id) {
  try {
    const response = await api.get(`/expenses/${id}`);
    return response.data || response;
  } catch (error) {
    console.error('Ошибка получения расхода по ID:', error);
    throw error;
  }
}

export async function addExpense(expenseData) {
  try {
    const response = await api.post('/expenses', expenseData);
    return response.data || response;
  } catch (error) {
    console.error('Ошибка добавления расхода:', error);
    throw error;
  }
}

export async function updateExpense(id, expenseData) {
  try {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data || response;
  } catch (error) {
    console.error('Ошибка обновления расхода:', error);
    throw error;
  }
}

export async function deleteExpense(id) {
  try {
    await api.del(`/expenses/${id}`);
  } catch (error) {
    console.error('Ошибка удаления расхода:', error);
    throw error;
  }
}