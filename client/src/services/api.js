// Базовый URL API
// В production на Vercel (когда клиент и сервер на одном домене) - относительный путь /api/v1
// В локальной разработке - http://localhost:3001/api/v1
const rawUrl = import.meta.env.VITE_API_URL || '';
const isProd = import.meta.env.PROD;
// В продакшене (Vercel) клиент и API на одном домене, поэтому используем относительный путь
// Если указан localhost в проде, игнорируем его
const effectiveUrl = (isProd && (!rawUrl || rawUrl.includes('localhost'))) 
  ? '' 
  : (rawUrl || (isProd ? '' : 'http://localhost:3001'));

const BASE_URL = effectiveUrl.endsWith('/api/v1') 
  ? effectiveUrl 
  : `${effectiveUrl}/api/v1`;

/**
 * Базовая функция для выполнения HTTP-запросов
 */
async function request(path, options = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${BASE_URL}${cleanPath}`;
  
  // Получаем токен из localStorage (если пользователь вошел в систему)
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Если токен есть, добавляем его в заголовки запроса
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (response.ok) {
      if (data.data !== undefined) {
        return {
          data: data.data,
          pagination: data.pagination || null,
        };
      }
      return data;
    }

    if (data.error) {
      const error = new Error(data.error.message || 'Произошла ошибка');
      error.code = data.error.code || 'UNKNOWN_ERROR';
      error.statusCode = response.status;
      throw error;
    }

    throw new Error(`Неожиданный формат ответа: ${JSON.stringify(data)}`);
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError = new Error('Ошибка сети: не удалось подключиться к серверу');
      networkError.code = 'NETWORK_ERROR';
      throw networkError;
    }
    throw error;
  }
}

export function get(path, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const fullPath = queryString ? `${path}?${queryString}` : path;
  
  return request(fullPath, {
    method: 'GET',
  });
}

export function post(path, body = {}) {
  return request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function put(path, body = {}) {
  return request(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

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