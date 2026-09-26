// server/src/middleware/errorHandler.js

// Функция-обработчик ошибок для Express.
// Перехватывает все ошибки, возникающие в роутах и контроллерах,
// и возвращает клиенту унифицированный JSON-ответ.
export const errorHandler = (err, req, res, next) => {
  // Логирование ошибки в консоль сервера для отладки
  console.error(`[ERROR] ${req.method} ${req.url}:`, err.message);

  // Если ошибка уже имеет статус (например, 404 или 400), используем его
  const statusCode = err.statusCode || 500;
  
  // Формируем ответ в едином формате
  res.status(statusCode).json({
    error: {
      code: statusCode,
      message: err.message || 'Внутренняя ошибка сервера',
    },
  });
};