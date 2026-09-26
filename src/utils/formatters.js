/**
 * Форматирование суммы в рубли
 * @param {number} amount - сумма
 * @param {boolean} showSign - показывать знак +/- (по умолчанию false)
 * @returns {string} отформатированная строка
 */
export const formatCurrency = (amount, showSign = false) => {
  const value = amount ?? 0;
  
  const formatted = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.abs(value));
  
  if (showSign) {
    const sign = value >= 0 ? '+' : '-';
    return `${sign}${formatted}`;
  }
  
  return value < 0 ? `-${formatted}` : formatted;
};

/**
 * Форматирование даты в короткий формат (ДД.ММ.ГГГГ)
 * @param {string|Date} date - дата
 * @returns {string} отформатированная дата
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
};

/**
 * Форматирование даты в длинный формат (ДД месяц ГГГГ)
 * @param {string|Date} date - дата
 * @returns {string} отформатированная дата
 */
export const formatDateLong = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(dateObj);
};

/**
 * Форматирование даты для группировки по месяцам (Месяц ГГГГ)
 * @param {string|Date} date - дата
 * @returns {string} отформатированная дата
 */
export const formatMonthYear = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric'
  }).format(dateObj);
};

/**
 * Получение сегодняшней даты в формате YYYY-MM-DD для input[type="date"]
 * @returns {string} дата в формате ISO
 */
export const getTodayISO = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Проверка, находится ли дата в текущем месяце
 * @param {string|Date} date - дата
 * @returns {boolean}
 */
export const isCurrentMonth = (date) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  return dateObj.getMonth() === now.getMonth() && 
         dateObj.getFullYear() === now.getFullYear();
};

/**
 * Проверка, находится ли дата в текущем году
 * @param {string|Date} date - дата
 * @returns {boolean}
 */
export const isCurrentYear = (date) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  return dateObj.getFullYear() === now.getFullYear();
};