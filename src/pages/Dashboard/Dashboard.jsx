import React, { useState, useEffect } from 'react';
import BalanceCard from '../../components/BalanceCard/BalanceCard';
import TransactionList from '../../components/TransactionList/TransactionList';
import Modal from '../../components/Modal/Modal';
import TransactionForm from '../../components/TransactionForm/TransactionForm';
import { getBalance, getTotalIncome, getTotalExpense, getRecentTransactions } from '../../services/summaryService';
import { addIncome } from '../../services/incomeService';
import { addExpense } from '../../services/expenseService';
import styles from './Dashboard.module.css';

function Dashboard() {
  // Состояние данных
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Состояние модалки
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadData();
  }, []);

  // Функция загрузки данных
  const loadData = () => {
    setTotalIncome(getTotalIncome());
    setTotalExpense(getTotalExpense());
    setBalance(getBalance());
    setRecentTransactions(getRecentTransactions(5)); // Последние 5 операций
  };

  // Обработчик открытия модалки
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Обработчик закрытия модалки
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Обработчик отправки формы (добавление операции)
  const handleSubmitForm = (data) => {
    if (data.type === 'income') {
      addIncome(data);
    } else {
      addExpense(data);
    }
    
    // Перезагружаем данные после добавления
    loadData();
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1 className={styles.title}>Главная</h1>

      {/* Карточки баланса */}
      <div className={styles.cardsGrid}>
        <BalanceCard
          title="Доходы"
          amount={totalIncome}
          variant="income"
        />
        <BalanceCard
          title="Расходы"
          amount={totalExpense}
          variant="expense"
        />
        <BalanceCard
          title="Баланс"
          amount={balance}
          variant="balance"
        />
      </div>

      {/* Кнопка добавления операции */}
      <button className={styles.addButton} onClick={handleOpenModal}>
        + Добавить операцию
      </button>

      {/* Секция последних операций */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Последние операции</h2>
        <TransactionList transactions={recentTransactions} />
      </div>

      {/* Модальное окно с формой */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Новая операция"
      >
        <TransactionForm
          onSubmit={handleSubmitForm}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}

export default Dashboard;