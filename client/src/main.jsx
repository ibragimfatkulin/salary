import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx' // Импортируем провайдер

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Оборачиваем всё приложение в AuthProvider */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)