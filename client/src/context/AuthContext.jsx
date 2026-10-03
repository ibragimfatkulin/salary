import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

// Создаем контекст
const AuthContext = createContext(null);

/**
 * Хук для удобного использования контекста в компонентах
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * Провайдер авторизации
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // При загрузке приложения проверяем, есть ли сохраненный токен
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // Если токен есть, пытаемся получить данные пользователя
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          // Если токен недействителен или истек, очищаем данные
          console.error('Ошибка получения профиля:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  /**
   * Функция входа в систему
   */
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user: userData, token: authToken } = response.data;
    
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(userData);
    
    return userData;
  };

  /**
   * Функция регистрации
   */
  const register = async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    const { user: userData, token: authToken } = response.data;
    
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(userData);
    
    return userData;
  };

  /**
   * Функция выхода из системы
   */
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Значения, которые будут доступны всем дочерним компонентам
  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};