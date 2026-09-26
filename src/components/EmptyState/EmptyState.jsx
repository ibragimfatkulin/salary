import React from 'react';
import styles from './EmptyState.module.css';

function EmptyState({ 
  icon = '📭', 
  title = 'Нет данных', 
  description, 
  actionLabel, 
  onAction 
}) {
  return (
    <div className={styles.emptyState}>
      {/* Иконка */}
      <div className={styles.icon}>{icon}</div>
      
      {/* Заголовок */}
      <div className={styles.title}>{title}</div>
      
      {/* Описание (если передано) */}
      {description && (
        <div className={styles.description}>{description}</div>
      )}
      
      {/* Кнопка действия (если переданы label и обработчик) */}
      {actionLabel && onAction && (
        <button className={styles.actionButton} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;