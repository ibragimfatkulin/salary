import React from 'react';
import Header from '../Header/Header';
import styles from './Layout.module.css';

function Layout({ children }) {
  return (
    <div className={styles.layout}>
      {/* Навигационная шапка */}
      <Header />
      
      {/* Основной контент страницы */}
      <main className={styles.main}>
        <div className={styles.container}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;