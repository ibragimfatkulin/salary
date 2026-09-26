import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Логотип — ссылка на главную */}
        <NavLink to="/" className={styles.logo}>
          💰 Salary Tracker
        </NavLink>

        {/* Навигация по страницам */}
        <nav className={styles.nav}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Главная
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            История
          </NavLink>
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Аналитика
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;