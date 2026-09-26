import React, { useEffect, useCallback } from 'react';
import styles from './Modal.module.css';

function Modal({ isOpen, onClose, title, children }) {
  // Обработчик закрытия по Escape
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    },
    [onClose]
  );

  // Добавляем/удаляем слушатель клавиатуры при открытии/закрытии
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Блокируем прокрутку body при открытой модалке
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Обработчик клика на overlay (закрытие при клике вне модалки)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  // Если модалка закрыта — ничего не рендерим
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        {/* Заголовок с кнопкой закрытия */}
        <div className={styles.header}>
          <h2 className={styles.title}>{title || 'Модальное окно'}</h2>
          <button
            className={styles.closeButton}
            onClick={() => onClose?.()}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        {/* Контент модального окна */}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

export default Modal;