import React, { useState, useEffect } from 'react';
import styles from './Analytics.module.css';
import PieChart from '../../components/PieChart/PieChart';
import BarChart from '../../components/BarChart/BarChart';
import { getByCategory, getMonthlySummary } from '../../services/summaryService';

function Analytics() {
  // Состояние для выбора периода в круговой диаграмме
  const [period, setPeriod] = useState('all');
  
  // Состояние данных для графиков
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  
  // Состояния загрузки и ошибок
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка данных при монтировании и изменении периода
  useEffect(() => {
    loadData();
  }, [period]);

  // Функция загрузки данных (асинхронная)
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Загружаем данные для обоих графиков параллельно
      const [categoryData, monthlyData] = await Promise.all([
        getByCategory('expense', period),
        getMonthlySummary(6),
      ]);

      setPieChartData(categoryData);
      setBarChartData(monthlyData);
    } catch (err) {
      console.error('Ошибка загрузки аналитики:', err);
      setError('Не удалось загрузить данные аналитики. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  // Показываем индикатор загрузки
  if (loading) {
    return (
      <div className={styles.analytics}>
        <h1 className={styles.title}>Аналитика</h1>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className={styles.analytics}>
        <h1 className={styles.title}>Аналитика</h1>
        <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
          <p>{error}</p>
          <button onClick={loadData} style={{ marginTop: '16px', padding: '8px 16px' }}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.analytics}>
      <h1 className={styles.title}>Аналитика</h1>

      {/* Сетка графиков */}
      <div className={styles.chartsGrid}>
        {/* Круговая диаграмма расходов по категориям */}
        <div className={styles.chartCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.chartTitle}>Расходы по категориям</h2>
            
            {/* Селектор периода */}
            <select
              className={styles.periodSelect}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="all">Всё время</option>
              <option value="today">Сегодня</option>
              <option value="week">Неделя</option>
              <option value="month">Месяц</option>
              <option value="year">Год</option>
            </select>
          </div>
          
          <PieChart
            data={pieChartData}
            title="Расходы по категориям"
          />
        </div>

        {/* Столбчатый график доходов/расходов по месяцам */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Доходы и расходы по месяцам</h2>
          
          <BarChart
            data={barChartData}
            title="Доходы и расходы по месяцам"
          />
        </div>
      </div>
    </div>
  );
}

export default Analytics;