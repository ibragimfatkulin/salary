import React from 'react';
import styles from './BalanceCard.module.css';

function BalanceCard({ title, amount, variant = 'balance' }) {
  // Fallback для amount
  const displayAmount = amount ?? 0;
  
  // Форматирование суммы с разделителями тысяч
  const formattedAmount = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(displayAmount);

  return (
    <div className={`${styles.card} ${styles[variant] || styles.balance}`}>
      <div className={styles.title}>{title || 'Баланс'}</div>
      <div className={styles.amount}>{formattedAmount}</div>
    </div>
  );
}

export default BalanceCard;