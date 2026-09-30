// Базовый URL API из переменных окружения Vite
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

/**
 * Базовая функция для выполнения HTTP-запросов
 * @param {string} path - путь эндпоинта (например, '/incomes')
 * @param {Object} options - опции запроса
 * @returns {Promise<any>} данные из ответа
 */
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  
  // Формируем заголовки
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Парсим JSON-ответ
    const data = await response.json();

    // Если ответ успешный (2xx)
    if (response.ok) {
      // Если есть поле data — возвращаем его (с пагинацией если есть)
      if (data.data !== undefined) {
        return {
          data: data.data,
          pagination: data.pagination || null,
        };
      }
      // Иначе возвращаем весь объект
      return data;
    }

    // Если ответ с ошибкой (4xx, 5xx)
    if (data.error) {
      const error = new Error(data.error.message || 'Произошла ошибка');
      error.code = data.error.code || 'UNKNOWN_ERROR';
      error.statusCode = response.status;
      throw error;
    }

    // Если формат ответа неожиданный
    throw new Error(`Неожиданный формат ответа: ${JSON.stringify(data)}`);
  } catch (error) {
    // Ошибки сети (нет соединения, таймаут и т.д.)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError = new Error('Ошибка сети: не удалось подключиться к серверу');
      networkError.code = 'NETWORK_ERROR';
      throw networkError;
    }
    
    // Пробрасываем остальные ошибки
    throw error;
  }
}

/**
 * GET-запрос
 * @param {string} path - путь эндпоинта
 * @param {Object} params - query-параметры (будут преобразованы в строку запроса)
 * @returns {Promise<any>} данные из ответа
 */
export function get(path, params = {}) {
  // Преобразуем объект params в query-строку
  const queryString = new URLSearchParams(params).toString();
  const fullPath = queryString ? `${path}?${queryString}` : path;
  
  return request(fullPath, {
    method: 'GET',
  });
}

/**
 * POST-запрос
 * @param {string} path - путь эндпоинта
 * @param {Object} body - тело запроса (будет сериализовано в JSON)
 * @returns {Promise<any>} данные из ответа
 */
export function post(path, body = {}) {
  return request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * PUT-запрос
 * @param {string} path - путь эндпоинта
 * @param {Object} body - тело запроса (будет сериализовано в JSON)
 * @returns {Promise<any>} данные из ответа
 */
export function put(path, body = {}) {
  return request(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * DELETE-запрос
 * @param {string} path - путь эндпоинта
 * @returns {Promise<any>} данные из ответа
 */
export function del(path) {
  return request(path, {
    method: 'DELETE',
  });
}

export default {
  get,
  post,
  put,
  del,
};