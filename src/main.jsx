import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';

// Временная заглушка App, пока не создан полноценный компонент
function App() {
  return (
    <div style={{ padding: '32px', textAlign: 'center' }}>
      <h1>Salary Tracker</h1>
      <p>Приложение успешно инициализировано. Глобальные стили применены.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);