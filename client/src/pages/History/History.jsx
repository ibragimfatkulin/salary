import React, { useState, useEffect, useMemo } from 'react';
import styles from './History.module.css';
import TransactionList from '../../components/TransactionList/TransactionList';
import Modal from '../../components/Modal/Modal';
import TransactionForm from '../../components/TransactionForm/TransactionForm';
import { getAllTransactions } from '../../services/summaryService';
import { addIncome, updateIncome, deleteIncome } from '../../services/incomeService';
import { addExpense, updateExpense, deleteExpense } from '../../services/expenseService';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../utils/constants';
import { isDateInPeriod } from '../../utils/formatters';

function History() {
  // Состояние фильтров
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');

  // Состояние модалки
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Состояние данных
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    loadData();
  }, []);

  // Функция загрузки данных (асинхронная)
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const transactions = await getAllTransactions();
      setAllTransactions(transactions);
    } catch (err) {
      console.error('Ошибка загрузки истории:', err);
      setError('Не удалось загрузить историю операций. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  // Мемоизированный список категорий без дубликатов по id
  const categoriesForFilter = useMemo(() => {
    if (typeFilter === 'income') {
      return INCOME_CATEGORIES;
    }
    if (typeFilter === 'expense') {
      return EXPENSE_CATEGORIES;
    }
    // Объединяем и удаляем дубликаты по id (например, 'other' есть и там, и там)
    const seen = new Set();
    return [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].filter((cat) => {
      if (seen.has(cat.id)) return false;
      seen.add(cat.id);
      return true;
    });
  }, [typeFilter]);

  // Фильтрация операций
  const filteredTransactions = (allTransactions || []).filter((transaction) => {
    // Фильтр по типу
    if (typeFilter !== 'all' && transaction?.type !== typeFilter) return false;
    
    // Фильтр по категории
    if (categoryFilter !== 'all' && transaction?.category !== categoryFilter) return false;
    
    // Фильтр по периоду
    if (!isDateInPeriod(transaction?.date, periodFilter)) return false;
    
    return true;
  });

  // Открытие модалки для добавления
  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  // Открытие модалки для редактирования
  const handleOpenEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  // Закрытие модалки
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  // Обработка отправки формы (добавление или редактирование) - асинхронная
  const handleSubmit = async (data) => {
    try {
      if (editingTransaction?.id) {
        // Редактирование существующей операции
        if (data.type === 'income') {
          await updateIncome(editingTransaction.id, data);
        } else {
          await updateExpense(editingTransaction.id, data);
        }
      } else {
        // Добавление новой операции
        if (data.type === 'income') {
          await addIncome(data);
        } else {
          await addExpense(data);
        }
      }
      
      // Перезагружаем данные
      await loadData();
      handleCloseModal();
    } catch (err) {
      console.error('Ошибка сохранения операции:', err);
      alert('Не удалось сохранить операцию. Попробуйте ещё раз.');
    }
  };

  // Обработка удаления операции - асинхронная
  const handleDelete = async (transaction) => {
    if (!transaction?.id) return;

    const confirmed = window.confirm('Вы уверены, что хотите удалить эту операцию?');
    if (!confirmed) return;

    try {
      if (transaction.type === 'income') {
        await deleteIncome(transaction.id);
      } else {
        await deleteExpense(transaction.id);
      }

      // Перезагружаем данные
      await loadData();
    } catch (err) {
      console.error('Ошибка удаления операции:', err);
      alert('Не удалось удалить операцию. Попробуйте ещё раз.');
    }
  };

  // Сброс фильтров
  const handleResetFilters = () => {
    setTypeFilter('all');
    setCategoryFilter('all');
    setPeriodFilter('all');
  };

  // Смена типа фильтра — сбрасываем фильтр по категории
  const handleTypeFilterChange = (newType) => {
    setTypeFilter(newType);
    setCategoryFilter('all');
  };

  // Показываем индикатор загрузки
  if (loading) {
    return (
      <div className={styles.history}>
        <h1 className={styles.title}>История операций</h1>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className={styles.history}>
        <h1 className={styles.title}>История операций</h1>
        <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
          <p>{error}</p>
          <button onClick={loadData} style={{ marginTop: '16px', padding: '8px 16px' }}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.history}>
      <h1 className={styles.title}>История операций</h1>

      {/* Панель фильтров */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Тип операции</label>
          <select
            className={styles.filterInput}
            value={typeFilter}
            onChange={(e) => handleTypeFilterChange(e.target.value)}
          >
            <option value="all">Все</option>
            <option value="income">Доходы</option>
            <option value="expense">Расходы</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Категория</label>
          <select
            className={styles.filterInput}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Все категории</option>
            {categoriesForFilter.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Период</label>
          <select
            className={styles.filterInput}
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
          >
            <option value="all">Всё время</option>
            <option value="today">Сегодня</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="year">Год</option>
          </select>
        </div>

        <button
          className={styles.resetButton}
          onClick={handleResetFilters}
        >
          Сбросить фильтры
        </button>
      </div>

      {/* Список операций */}
      <div className={styles.listContainer}>
        <TransactionList
          transactions={filteredTransactions}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
        />
      </div>

      {/* Модальное окно с формой */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTransaction ? 'Редактировать операцию' : 'Новая операция'}
      >
        <TransactionForm
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          editData={editingTransaction}
        />
      </Modal>
    </div>
  );
}

export default History;