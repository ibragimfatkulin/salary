import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

function Dashboard() {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    comment: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/v1/summary/transactions?limit=10', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.data) {
        setTransactions(data.data);
      }

      const balanceResponse = await fetch('http://localhost:3001/api/v1/summary/balance', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const balanceData = await balanceResponse.json();
      if (balanceData.data) {
        setBalance(balanceData.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = formData.type === 'income' 
        ? 'http://localhost:3001/api/v1/incomes'
        : 'http://localhost:3001/api/v1/expenses';

      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          date: formData.date,
          category: formData.category,
          comment: formData.comment
        })
      });

      setShowForm(false);
      setShowCalendar(false);
      setFormData({
        type: 'income',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        comment: ''
      });
      loadData();
    } catch (error) {
      console.error('Ошибка добавления:', error);
      alert('Не удалось добавить операцию');
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Удалить эту операцию?')) return;
    
    try {
      const endpoint = type === 'income'
        ? `http://localhost:3001/api/v1/incomes/${id}`
        : `http://localhost:3001/api/v1/expenses/${id}`;

      await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      loadData();
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const categories = {
    income: ['Зарплата', 'Подработка', 'Подарок', 'Инвестиции', 'Другое'],
    expense: ['Еда', 'Транспорт', 'Развлечения', 'Одежда', 'Здоровье', 'Жильё', 'Другое']
  };

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const handleDateSelect = (day) => {
    const month = String(calendarMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    setFormData({...formData, date: `${calendarYear}-${month}-${dayStr}`});
    setShowCalendar(false);
  };

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const formatDateDisplay = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  };

  return (
    <div style={styles.layout}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.logo}>💰 Мой Бюджет</h1>
        </div>
        <nav style={styles.headerNav}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            style={{
              ...styles.navButton,
              backgroundColor: activeTab === 'dashboard' ? '#3b82f6' : 'transparent',
              color: activeTab === 'dashboard' ? 'white' : '#374151'
            }}
          >
            📊 Главная
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            style={{
              ...styles.navButton,
              backgroundColor: activeTab === 'analytics' ? '#3b82f6' : 'transparent',
              color: activeTab === 'analytics' ? 'white' : '#374151'
            }}
          >
            📈 Аналитика
          </button>
        </nav>
        <div style={styles.headerRight}>
          <span style={styles.userEmail}>{user?.email}</span>
          <button onClick={logout} style={styles.logoutButton}>
            🚪 Выйти
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {activeTab === 'dashboard' && (
          <div style={styles.content}>
            <h2 style={styles.pageTitle}>Главная</h2>
            
            <div style={styles.balanceCards}>
              <div style={{...styles.card, backgroundColor: '#10b981'}}>
                <div style={styles.cardIcon}>💵</div>
                <div style={styles.cardLabel}>Доходы</div>
                <div style={styles.cardValue}>{balance.totalIncome.toLocaleString()} ₽</div>
              </div>
              <div style={{...styles.card, backgroundColor: '#ef4444'}}>
                <div style={styles.cardIcon}>💸</div>
                <div style={styles.cardLabel}>Расходы</div>
                <div style={styles.cardValue}>{balance.totalExpense.toLocaleString()} ₽</div>
              </div>
              <div style={{...styles.card, backgroundColor: '#3b82f6'}}>
                <div style={styles.cardIcon}>💳</div>
                <div style={styles.cardLabel}>Баланс</div>
                <div style={styles.cardValue}>{balance.balance.toLocaleString()} ₽</div>
              </div>
            </div>

            <button onClick={() => setShowForm(true)} style={styles.fabButton}>
              <span style={styles.fabIcon}>+</span>
              <span>Добавить операцию</span>
            </button>

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Последние операции</h3>
              {loading ? (
                <p style={styles.loading}>Загрузка...</p>
              ) : transactions.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📋</div>
                  <p style={styles.emptyText}>Нет операций</p>
                  <p style={styles.emptySubtext}>Добавьте первую операцию, чтобы увидеть историю</p>
                </div>
              ) : (
                <div style={styles.transactionsList}>
                  {transactions.map((t) => (
                    <div key={t.id} style={styles.transactionItem}>
                      <div style={styles.transactionLeft}>
                        <div style={styles.transactionCategory}>{t.category}</div>
                        <div style={styles.transactionDate}>
                          {new Date(t.date).toLocaleDateString('ru-RU')}
                        </div>
                        {t.comment && <div style={styles.transactionComment}>{t.comment}</div>}
                      </div>
                      <div style={styles.transactionRight}>
                        <div style={{
                          ...styles.transactionAmount,
                          color: t.type === 'income' ? '#10b981' : '#ef4444'
                        }}>
                          {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} ₽
                        </div>
                        <button 
                          onClick={() => handleDelete(t.id, t.type)}
                          style={styles.deleteButton}
                        >
                          
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div style={styles.content}>
            <h2 style={styles.pageTitle}>Аналитика</h2>
            
            <div style={styles.analyticsCard}>
              <h3 style={styles.analyticsTitle}>📊 Соотношение доходов и расходов</h3>
              {transactions.length === 0 ? (
                <div style={styles.noDataContainer}>
                  <div style={styles.noDataIcon}>📊</div>
                  <p style={styles.noData}>Нет данных для отображения</p>
                </div>
              ) : (
                <div style={styles.chartWrapper}>
                  <div style={styles.pieChartContainer}>
                    <svg width="280" height="280" viewBox="0 0 200 200">
                      {(() => {
                        const total = balance.totalIncome + balance.totalExpense;
                        if (total === 0) return null;
                        
                        const incomePercent = (balance.totalIncome / total) * 100;
                        const expensePercent = (balance.totalExpense / total) * 100;
                        
                        const incomeAngle = (incomePercent / 100) * 360;
                        const expenseAngle = (expensePercent / 100) * 360;
                        
                        const startAngle = 0;
                        const endAngle = incomeAngle;
                        
                        const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                        const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                        const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                        const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
                        const largeArcFlag = incomeAngle > 180 ? 1 : 0;
                        
                        const incomeMidAngle = startAngle + incomeAngle / 2;
                        const incomeTextX = 100 + 50 * Math.cos((incomeMidAngle - 90) * Math.PI / 180);
                        const incomeTextY = 100 + 50 * Math.sin((incomeMidAngle - 90) * Math.PI / 180);
                        
                        const expenseStartAngle = incomeAngle;
                        const expenseEndAngle = incomeAngle + expenseAngle;
                        
                        const ex1 = 100 + 80 * Math.cos((expenseStartAngle - 90) * Math.PI / 180);
                        const ey1 = 100 + 80 * Math.sin((expenseStartAngle - 90) * Math.PI / 180);
                        const ex2 = 100 + 80 * Math.cos((expenseEndAngle - 90) * Math.PI / 180);
                        const ey2 = 100 + 80 * Math.sin((expenseEndAngle - 90) * Math.PI / 180);
                        const expenseLargeArcFlag = expenseAngle > 180 ? 1 : 0;
                        
                        const expenseMidAngle = expenseStartAngle + expenseAngle / 2;
                        const expenseTextX = 100 + 50 * Math.cos((expenseMidAngle - 90) * Math.PI / 180);
                        const expenseTextY = 100 + 50 * Math.sin((expenseMidAngle - 90) * Math.PI / 180);
                        
                        return (
                          <>
                            {/* Сектор доходов (зелёный) */}
                            <path 
                              d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`} 
                              fill="#10b981" 
                              stroke="white" 
                              strokeWidth="2" 
                            />
                            {incomePercent >= 10 && (
                              <text x={incomeTextX} y={incomeTextY} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="16" fontWeight="bold">
                                {incomePercent.toFixed(0)}%
                              </text>
                            )}
                            
                            {/* Сектор расходов (красный) */}
                            <path 
                              d={`M 100 100 L ${ex1} ${ey1} A 80 80 0 ${expenseLargeArcFlag} 1 ${ex2} ${ey2} Z`} 
                              fill="#ef4444" 
                              stroke="white" 
                              strokeWidth="2" 
                            />
                            {expensePercent >= 10 && (
                              <text x={expenseTextX} y={expenseTextY} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="16" fontWeight="bold">
                                {expensePercent.toFixed(0)}%
                              </text>
                            )}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                  
                  <div style={styles.legend}>
                    <div style={styles.legendItem}>
                      <div style={{...styles.legendColor, backgroundColor: '#10b981'}}></div>
                      <span style={styles.legendLabel}>Доходы</span>
                      <span style={styles.legendValue}>{balance.totalIncome.toLocaleString()} ₽ ({((balance.totalIncome / (balance.totalIncome + balance.totalExpense)) * 100).toFixed(1)}%)</span>
                    </div>
                    <div style={styles.legendItem}>
                      <div style={{...styles.legendColor, backgroundColor: '#ef4444'}}></div>
                      <span style={styles.legendLabel}>Расходы</span>
                      <span style={styles.legendValue}>{balance.totalExpense.toLocaleString()} ₽ ({((balance.totalExpense / (balance.totalIncome + balance.totalExpense)) * 100).toFixed(1)}%)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Общая статистика */}
            <div style={styles.analyticsSection}>
              <h3 style={styles.analyticsTitle}>📊 Общая статистика</h3>
              <div style={styles.statsGrid}>
                <div style={styles.statItem}>
                  <div style={styles.statLabel}>Всего операций</div>
                  <div style={styles.statValue}>{transactions.length}</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statLabel}>Доходов</div>
                  <div style={{...styles.statValue, color: '#10b981'}}>{transactions.filter(t => t.type === 'income').length}</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statLabel}>Расходов</div>
                  <div style={{...styles.statValue, color: '#ef4444'}}>{transactions.filter(t => t.type === 'expense').length}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showForm && (
        <div style={styles.modal} onClick={() => { setShowForm(false); setShowCalendar(false); }}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Новая операция</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Тип операции</label>
                <div style={styles.typeButtons}>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'income'})}
                    style={{
                      ...styles.typeButton,
                      backgroundColor: formData.type === 'income' ? '#10b981' : '#e5e7eb',
                      color: formData.type === 'income' ? 'white' : '#374151'
                    }}
                  >
                    💵 Доход
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'expense'})}
                    style={{
                      ...styles.typeButton,
                      backgroundColor: formData.type === 'expense' ? '#ef4444' : '#e5e7eb',
                      color: formData.type === 'expense' ? 'white' : '#374151'
                    }}
                  >
                    💸 Расход
                  </button>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Сумма (₽) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  style={styles.input}
                  placeholder="0.00"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Категория *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  style={styles.select}
                >
                  <option value="">Выберите категорию</option>
                  {categories[formData.type].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Дата *</label>
                <div style={styles.dateFieldWrapper}>
                  <div 
                    style={styles.dateInput}
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    📅 {formatDateDisplay(formData.date)}
                  </div>
                  {showCalendar && (
                    <div style={styles.calendarPopup}>
                      <div style={styles.calendarHeader}>
                        <button type="button" onClick={prevMonth} style={styles.calendarNavBtn}>◀</button>
                        <span style={styles.calendarMonthTitle}>{monthNames[calendarMonth]} {calendarYear}</span>
                        <button type="button" onClick={nextMonth} style={styles.calendarNavBtn}>▶</button>
                      </div>
                      <div style={styles.calendarGrid}>
                        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
                          <div key={d} style={styles.calendarDayHeader}>{d}</div>
                        ))}
                        {Array.from({ length: adjustedFirstDay }).map((_, i) => (
                          <div key={`empty-${i}`} style={styles.calendarDay}></div>
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const isSelected = formData.date === `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const isToday = day === new Date().getDate() && calendarMonth === new Date().getMonth() && calendarYear === new Date().getFullYear();
                          return (
                            <div
                              key={day}
                              onClick={() => handleDateSelect(day)}
                              style={{
                                ...styles.calendarDay,
                                ...(isSelected ? styles.calendarDaySelected : {}),
                                ...(isToday && !isSelected ? styles.calendarDayToday : {})
                              }}
                            >
                              {day}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Комментарий</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                  style={styles.textarea}
                  placeholder="Необязательное поле"
                  rows="2"
                />
              </div>

              <div style={styles.formButtons}>
                <button type="button" onClick={() => { setShowForm(false); setShowCalendar(false); }} style={styles.cancelButton}>
                  Отмена
                </button>
                <button type="submit" style={styles.submitButton}>
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    width: '100%'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    width: '100%',
    boxSizing: 'border-box'
  },
  headerLeft: {
    flex: 1
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0
  },
  headerNav: {
    display: 'flex',
    gap: '12px',
    flex: 2,
    justifyContent: 'center'
  },
  navButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  headerRight: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '16px'
  },
  userEmail: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#fee2e2',
    color: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  main: {
    flex: 1,
    padding: '32px',
    width: '100%',
    boxSizing: 'border-box'
  },
  content: {
    width: '100%',
    boxSizing: 'border-box'
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '24px'
  },
  balanceCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '24px'
  },
  card: {
    padding: '24px',
    borderRadius: '16px',
    color: 'white',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  cardIcon: {
    fontSize: '32px',
    marginBottom: '12px'
  },
  cardLabel: {
    fontSize: '14px',
    opacity: 0.9,
    marginBottom: '8px'
  },
  cardValue: {
    fontSize: '28px',
    fontWeight: 'bold'
  },
  fabButton: {
    width: '100%',
    padding: '16px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
  },
  fabIcon: {
    fontSize: '24px',
    fontWeight: 'bold'
  },
  section: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '20px'
  },
  loading: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '40px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  emptyText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#9ca3af'
  },
  transactionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  transactionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },
  transactionLeft: {
    flex: 1
  },
  transactionCategory: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px',
    fontSize: '15px'
  },
  transactionDate: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '4px'
  },
  transactionComment: {
    fontSize: '13px',
    color: '#9ca3af'
  },
  transactionRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginLeft: '16px'
  },
  transactionAmount: {
    fontWeight: 'bold',
    fontSize: '16px'
  },
  deleteButton: {
    width: '32px',
    height: '32px',
    backgroundColor: '#fee2e2',
    color: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  analyticsCard: {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px'
  },
  analyticsSection: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px'
  },
  analyticsTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '24px',
    textAlign: 'center'
  },
  chartWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px'
  },
  pieChartContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  legend: {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  legendColor: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    flexShrink: 0
  },
  legendLabel: {
    flex: 1,
    fontWeight: '600',
    color: '#374151',
    fontSize: '15px'
  },
  legendValue: {
    fontWeight: '700',
    color: '#111827',
    fontSize: '15px'
  },
  noDataContainer: {
    textAlign: 'center',
    padding: '40px 20px'
  },
  noDataIcon: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  noData: {
    color: '#9ca3af',
    fontSize: '16px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px'
  },
  statItem: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px'
  },
  statLabel: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '8px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
    position: 'relative'
  },
  modalTitle: {
    margin: '0 0 24px 0',
    fontSize: '24px',
    color: '#111827',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  formGroup: {
    marginBottom: '20px',
    position: 'relative'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#374151',
    fontSize: '14px'
  },
  typeButtons: {
    display: 'flex',
    gap: '12px'
  },
  typeButton: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    color: '#111827'
  },
  dateFieldWrapper: {
    position: 'relative'
  },
  dateInput: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    color: '#111827',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  calendarPopup: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    zIndex: 100,
    marginTop: '4px',
    padding: '16px'
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  calendarNavBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    color: '#374151'
  },
  calendarMonthTitle: {
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#111827'
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px'
  },
  calendarDayHeader: {
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    padding: '8px 0'
  },
  calendarDay: {
    textAlign: 'center',
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151',
    transition: 'all 0.2s'
  },
  calendarDaySelected: {
    backgroundColor: '#3b82f6',
    color: 'white',
    fontWeight: 'bold'
  },
  calendarDayToday: {
    backgroundColor: '#dbeafe',
    color: '#3b82f6',
    fontWeight: 'bold'
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    color: '#111827',
    cursor: 'pointer'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
    backgroundColor: 'white',
    color: '#111827'
  },
  formButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '28px'
  },
  cancelButton: {
    flex: 1,
    padding: '14px',
    backgroundColor: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600'
  },
  submitButton: {
    flex: 1,
    padding: '14px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600'
  }
};

if (typeof window !== 'undefined') {
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    styles.header = {
      ...styles.header,
      padding: '12px 16px',
      flexDirection: 'column',
      gap: '12px'
    };
    styles.headerNav = {
      ...styles.headerNav,
      flex: 1,
      width: '100%'
    };
    styles.headerRight = {
      ...styles.headerRight,
      width: '100%',
      justifyContent: 'space-between'
    };
    styles.main = {
      ...styles.main,
      padding: '16px'
    };
    styles.balanceCards = {
      ...styles.balanceCards,
      gridTemplateColumns: '1fr'
    };
    styles.statsGrid = {
      ...styles.statsGrid,
      gridTemplateColumns: '1fr'
    };
  }
}

export default Dashboard;