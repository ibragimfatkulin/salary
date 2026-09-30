import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import BalanceCard from '../../components/BalanceCard/BalanceCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import Modal from '../../components/Modal/Modal';
import TransactionForm from '../../components/TransactionForm/TransactionForm';
import TransactionList from '../../components/TransactionList/TransactionList';
import { getBalance, getAllTransactions } from '../../services/summaryService';
import { addIncome, deleteIncome } from '../../services/incomeService';
import { addExpense, deleteExpense } from '../../services/expenseService';

function Dashboard() {
  // Состояние модалки
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Состояние данных
  const [balanceData, setBalanceData] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
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

      // Загружаем баланс и последние 5 операций параллельно
      const [balance, transactions] = await Promise.all([
        getBalance(),
        getAllTransactions(5),
      ]);

      setBalanceData(balance);
      setRecentTransactions(transactions);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError('Не удалось загрузить данные. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Обработка добавления операции (асинхронная)
  const handleSubmit = async (data) => {
    try {
      if (data.type === 'income') {
        await addIncome(data);
      } else {
        await addExpense(data);
      }
      
      // Перезагружаем данные после добавления
      await loadData();
      handleCloseModal();
    } catch (err) {
      console.error('Ошибка добавления операции:', err);
      alert('Не удалось добавить операцию. Попробуйте ещё раз.');
    }
  };

  // Обработка удаления операции (асинхронная)
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

      // Перезагружаем данные после удаления
      await loadData();
    } catch (err) {
      console.error('Ошибка удаления операции:', err);
      alert('Не удалось удалить операцию. Попробуйте ещё раз.');
    }
  };

  // Обработка редактирования
  const handleEdit = (transaction) => {
    console.log('Редактировать операцию:', transaction);
    alert('Редактирование будет подключено позже');
  };

  // Показываем индикатор загрузки
  if (loading) {
    return (
      <div className={styles.dashboard}>
        <h1 className={styles.title}>Главная</h1>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className={styles.dashboard}>
        <h1 className={styles.title}>Главная</h1>
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
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Главная</h1>
      
      {/* Карточки баланса */}
      <div className={styles.balanceGrid}>
        <BalanceCard
          title="Доходы"
          amount={balanceData.totalIncome}
          color="#10b981"
        />
        <BalanceCard
          title="Расходы"
          amount={balanceData.totalExpense}
          color="#ef4444"
        />
        <BalanceCard
          title="Баланс"
          amount={balanceData.balance}
          color="#2563eb"
        />
      </div>

      {/* Секция последних операций */}
      <div className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Последние операции</h2>
        </div>
        
        <TransactionList
          transactions={recentTransactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Плавающая кнопка добавления */}
      <button
        className={styles.addButton}
        onClick={handleOpenModal}
        title="Добавить операцию"
      >
        +
      </button>

      {/* Модальное окно с формой */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Новая операция"
      >
        <TransactionForm
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}

export default Dashboard;