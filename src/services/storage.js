/**
 * Безопасное получение данных из localStorage
 * @param {string} key - ключ
 * @param {*} defaultValue - значение по умолчанию (если ключ не найден или ошибка)
 * @returns {*} распарсенные данные или defaultValue
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Безопасная запись данных в localStorage
 * @param {string} key - ключ
 * @param {*} value - значение (будет сериализовано в JSON)
 * @returns {boolean} true если успешно, false если ошибка
 */
export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Удаление данных из localStorage
 * @param {string} key - ключ
 * @returns {boolean} true если успешно, false если ошибка
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Генерация уникального идентификатора (UUID)
 * @returns {string} UUID v4
 */
export const generateId = () => {
  // Используем crypto.randomUUID() если доступен (современные браузеры)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback для старых браузеров
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};