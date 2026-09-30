import * as api from './api.js';

export async function getIncomes(filters = {}) {
  try {
    const response = await api.get('/incomes', filters);
    return response;
  } catch (error) {
    console.error('Ошибка получения доходов:', error);
    throw error;
  }
}

export async function getIncomeById(id) {
  try {
    const response = await api.get(`/incomes/${id}`);
    return response.data || response;
  } catch (error) {
    console.error('Ошибка получения дохода по ID:', error);
    throw error;
  }
}

export async function addIncome(incomeData) {
  try {
    const response = await api.post('/incomes', incomeData);
    return response.data || response;
  } catch (error) {
    console.error('Ошибка добавления дохода:', error);
    throw error;
  }
}

export async function updateIncome(id, incomeData) {
  try {
    const response = await api.put(`/incomes/${id}`, incomeData);
    return response.data || response;
  } catch (error) {
    console.error('Ошибка обновления дохода:', error);
    throw error;
  }
}

export async function deleteIncome(id) {
  try {
    await api.del(`/incomes/${id}`);
  } catch (error) {
    console.error('Ошибка удаления дохода:', error);
    throw error;
  }
}