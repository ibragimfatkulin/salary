import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      // При успехе AuthContext сам обновит состояние user, и приложение перерисуется
    } catch (err) {
      setError(err.message || 'Произошла ошибка. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>{isLogin ? 'Вход в систему' : 'Регистрация'}</h1>
        
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="example@mail.com"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={styles.input}
              placeholder="Минимум 6 символов"
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>

        <div style={styles.footer}>
          <span>
            {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
          </span>
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }} 
            style={styles.linkButton}
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Простые встроенные стили для быстрого старта
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' },
  card: { backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  title: { textAlign: 'center', marginBottom: '1.5rem', color: '#333' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.9rem', fontWeight: 'bold', color: '#555' },
  input: { padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '1rem' },
  button: { padding: '0.75rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', marginTop: '1rem' },
  error: { backgroundColor: '#ffebee', color: '#c62828', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' },
  footer: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' },
  linkButton: { background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '0.9rem', marginLeft: '0.5rem' }
};