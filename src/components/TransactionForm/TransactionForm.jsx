import React, { useState, useEffect } from 'react';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../utils/constants';
import styles from './TransactionForm.module.css';

function TransactionForm({ onSubmit, onCancel, editData }) {
  // Начальное состояние формы
  const initialState = {
    type: editData?.type || 'expense',
    categoryId: editData?.categoryId || '',
    amount: editData?.amount || '',
    date: editData?.date || new Date().toISOString().split('T')[0],
    comment: editData?.comment || ''
  };

  const [formData, setFormData] = useState(initialState);

  // Обновление формы при изменении editData
  useEffect(() => {
    if (editData) {
      setFormData({
        type: editData.type || 'expense',
        categoryId: editData.categoryId || '',
        amount: editData.amount || '',
        date: editData.date || new Date().toISOString().split('T')[0],
        comment: editData.comment || ''
      });
    }
  }, [editData]);

  // Получение списка категорий в зависимости от типа операции
  const categories = formData.type === 'income' 
    ? INCOME_CATEGORIES 
    : EXPENSE_CATEGORIES;

  // Обработчик изменения полей
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Обработчик изменения типа операции
  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      type,
      categoryId: '' // Сбрасываем категорию при смене типа
    }));
  };

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.categoryId || !formData.amount || !formData.date) {
      return;
    }

    // Получаем label категории
    const category = categories.find(c => c.id === formData.categoryId);
    
    // Формируем данные для отправки
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      categoryLabel: category?.label || 'Без категории'
    };

    onSubmit(transactionData);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Переключатель типа операции */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Тип операции</label>
        <div className={styles.typeSwitcher}>
          <button
            type="button"
            className={`${styles.typeButton} ${formData.type === 'income' ? styles.typeButtonActive : ''}`}
            onClick={() => handleTypeChange('income')}
          >
            Доход
          </button>
          <button
            type="button"
            className={`${styles.typeButton} ${formData.type === 'expense' ? styles.typeButtonActive : ''}`}
            onClick={() => handleTypeChange('expense')}
          >
            Расход
          </button>
        </div>
      </div>

      {/* Категория и сумма */}
      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Категория <span className={styles.required}>*</span>
          </label>
          <select
            className={styles.select}
            value={formData.categoryId}
            onChange={(e) => handleChange('categoryId', e.target.value)}
            required
          >
            <option value="">Выберите категорию</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Сумма <span className={styles.required}>*</span>
          </label>
          <input
            type="number"
            className={styles.input}
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            placeholder="0"
            min="0.01"
            step="0.01"
            required
          />
        </div>
      </div>

      {/* Дата */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Дата <span className={styles.required}>*</span>
        </label>
        <input
          type="date"
          className={styles.input}
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          required
        />
      </div>

      {/* Комментарий */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Комментарий</label>
        <textarea
          className={styles.textarea}
          value={formData.comment}
          onChange={(e) => handleChange('comment', e.target.value)}
          placeholder="Необязательное примечание"
          maxLength="200"
        />
      </div>

      {/* Кнопки действий */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancel}
        >
          Отмена
        </button>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={!formData.categoryId || !formData.amount || !formData.date}
        >
          {editData ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </form>
  );
}

export default TransactionForm;