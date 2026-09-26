import React, { useState, useEffect } from 'react';
import TransactionList from '../../components/TransactionList/TransactionList';
import Modal from '../../components/Modal/Modal';
import TransactionForm from '../../components/TransactionForm/TransactionForm';
import { getIncomes, updateIncome, deleteIncome } from '../../services/incomeService';
import { getExpenses, updateExpense, deleteExpense } from '../../services/expenseService';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../utils/constants';
import { isCurrentMonth, isCurrentYear } from '../../utils/formatters';
import styles from './History.module.css';

function History() {
  // Состояние данных
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // Состояние фильтров
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    period: 'all'
  });

  // Состояние модалки
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadData();
  }, []);

  // Применение фильтров при изменении данных или фильтров
  useEffect(() => {
    applyFilters();
  }, [allTransactions, filters]);

  // Функция загрузки данных
  const loadData = () => {
    const incomes = getIncomes();
    const expenses = getExpenses();
    
    // Объединение и сортировка по дате (новые первыми)
    const combined = [...incomes, ...expenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setAllTransactions(combined);
  };

  // Применение фильтров
  const applyFilters = () => {
    let filtered = [...allTransactions];

    // Фильтр по типу
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Фильтр по категории
    if (filters.category !== 'all') {
      filtered = filtered.filter(t => t.categoryId === filters.category);
    }

    // Фильтр по периоду
    if (filters.period !== 'all') {
      filtered = filtered.filter(t => {
        if (filters.period === 'month') {
          return isCurrentMonth(t.date);
        }
        if (filters.period === 'year') {
          return isCurrentYear(t.date);
        }
        return true;
      });
    }

    setFilteredTransactions(filtered);
  };

  // Обработчик изменения фильтра
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setFilters({
      type: 'all',
      category: 'all',
      period: 'all'
    });
  };

  // Обработчик редактирования операции
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  // Обработчик удаления операции
  const handleDelete = (id) => {
    if (!confirm('Вы уверены, что хотите удалить эту операцию?')) {
      return;
    }

    // Определяем тип операции и вызываем соответствующий сервис
    const transaction = allTransactions.find(t => t.id === id);
    if (transaction?.type === 'income') {
      deleteIncome(id);
    } else {
      deleteExpense(id);
    }

    // Перезагружаем данные
    loadData();
  };

  // Обработчик открытия модалки для новой операции
  const handleOpenModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  // Обработчик закрытия модалки
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  // Обработчик отправки формы (добавление или обновление)
  const handleSubmitForm = (data) => {
    if (editingTransaction) {
      // Обновление существующей операции
      if (editingTransaction.type === 'income') {
        updateIncome(editingTransaction.id, data);
      } else {
        updateExpense(editingTransaction.id, data);
      }
    } else {
      // Добавление новой операции
      if (data.type === 'income') {
        addIncome(data);
      } else {
        addExpense(data);
      }
    }

    // Перезагружаем данные
    loadData();
    handleCloseModal();
  };

  // Получение списка категорий для фильтра (объединение доходов и расходов)
  const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  return (
    <div>
      <h1 className={styles.title}>История операций</h1>

      {/* Панель фильтров */}
      <div className={styles.filters}>
        {/* Фильтр по типу операции */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Тип операции</label>
          <select
            className={styles.filterSelect}
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="all">Все</option>
            <option value="income">Доходы</option>
            <option value="expense">Расходы</option>
          </select>
        </div>

        {/* Фильтр по категории */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Категория</label>
          <select
            className={styles.filterSelect}
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="all">Все категории</option>
            {allCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Фильтр по периоду */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Период</label>
          <select
            className={styles.filterSelect}
            value={filters.period}
            onChange={(e) => handleFilterChange('period', e.target.value)}
          >
            <option value="all">Всё время</option>
            <option value="month">Этот месяц</option>
            <option value="year">Этот год</option>
          </select>
        </div>

        {/* Кнопка сброса фильтров */}
        <button
          className={styles.resetButton}
          onClick={handleResetFilters}
        >
          Сбросить
        </button>
      </div>

      {/* Контейнер списка операций */}
      <div className={styles.listContainer}>
        <h2 className={styles.sectionTitle}>
          Все операции ({filteredTransactions.length})
        </h2>
        <TransactionList
          transactions={filteredTransactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Модальное окно с формой */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTransaction ? 'Редактирование операции' : 'Новая операция'}
      >
        <TransactionForm
          onSubmit={handleSubmitForm}
          onCancel={handleCloseModal}
          editData={editingTransaction}
        />
      </Modal>
    </div>
  );
}

export default History;