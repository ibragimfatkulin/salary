import React from 'react';
import EmptyState from '../EmptyState/EmptyState';
import styles from './TransactionList.module.css';

// Маппинг категорий на иконки
const CATEGORY_ICONS = {
  // Доходы
  salary: '💼',
  freelance: '💻',
  bonus: '🎁',
  debt_return: '💰',
  deposit_interest: '🏦',
  gift: '🎀',
  // Расходы
  groceries: '🛒',
  utilities: '💡',
  rent: '🏠',
  subscriptions: '📱',
  transport: '🚌',
  health: '⚕️',
  clothing: '👕',
  entertainment: '🎬',
  communication: '📞',
  // Прочее
  other: '📦'
};

// Форматирование суммы
const formatAmount = (amount, type) => {
  const value = amount ?? 0;
  const formatted = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
  
  return type === 'income' ? `+${formatted}` : `-${formatted}`;
};

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

function TransactionList({ transactions, onEdit, onDelete }) {
  // Fallback для transactions
  const items = transactions || [];

  // Если список пуст — показываем EmptyState
  if (items.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="Нет операций"
        description="Добавьте первую операцию, чтобы увидеть её здесь"
      />
    );
  }

  return (
    <div className={styles.list}>
      {items.map((transaction) => {
        const icon = CATEGORY_ICONS[transaction.categoryId] || CATEGORY_ICONS.other;
        const amountClass = transaction.type === 'income' 
          ? styles.incomeAmount 
          : styles.expenseAmount;

        return (
          <div key={transaction.id} className={styles.row}>
            {/* Иконка категории */}
            <div className={styles.categoryIcon}>
              {icon}
            </div>

            {/* Информация об операции */}
            <div className={styles.info}>
              <div className={styles.categoryName}>
                {transaction.categoryLabel || 'Без категории'}
              </div>
              <div className={styles.meta}>
                {transaction.comment && `${transaction.comment} • `}
                {formatDate(transaction.date)}
              </div>
            </div>

            {/* Сумма */}
            <div className={`${styles.amount} ${amountClass}`}>
              {formatAmount(transaction.amount, transaction.type)}
            </div>

            {/* Кнопки действий */}
            <div className={styles.actions}>
              {onEdit && (
                <button
                  className={styles.actionButton}
                  onClick={() => onEdit(transaction)}
                  aria-label="Редактировать"
                  title="Редактировать"
                >
                  ✏️
                </button>
              )}
              {onDelete && (
                <button
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => onDelete(transaction.id)}
                  aria-label="Удалить"
                  title="Удалить"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TransactionList;