import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import styles from './App.module.css';

// Временные заглушки для страниц (будут заменены на полноценные компоненты позже)
function DashboardPlaceholder() {
  return (
    <div style={{ padding: '32px', textAlign: 'center' }}>
      <h2>Главная</h2>
      <p>Страница дашборда будет здесь</p>
    </div>
  );
}

function HistoryPlaceholder() {
  return (
    <div style={{ padding: '32px', textAlign: 'center' }}>
      <h2>История</h2>
      <p>Страница истории операций будет здесь</p>
    </div>
  );
}

function AnalyticsPlaceholder() {
  return (
    <div style={{ padding: '32px', textAlign: 'center' }}>
      <h2>Аналитика</h2>
      <p>Страница аналитики будет здесь</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <Routes>
          <Route path="/" element={<DashboardPlaceholder />} />
          <Route path="/history" element={<HistoryPlaceholder />} />
          <Route path="/analytics" element={<AnalyticsPlaceholder />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;