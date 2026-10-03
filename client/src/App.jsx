import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard/Dashboard'; // <-- Исправленный путь

function App() {
  const { user, loading, isAuthenticated } = useAuth();

  // Пока идёт проверка авторизации (чтение токена из localStorage и запрос к /auth/me)
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Загрузка...</p>
      </div>
    );
  }

  // Если пользователь не авторизован — показываем страницу входа/регистрации
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Если авторизован — показываем Dashboard
  return <Dashboard />;
}

export default App;