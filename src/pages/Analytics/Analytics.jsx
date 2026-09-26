import React, { useState, useEffect } from 'react';
import PieChart from '../../components/PieChart/PieChart';
import BarChart from '../../components/BarChart/BarChart';
import { getByCategory, getMonthlySummary } from '../../services/summaryService';
import styles from './Analytics.module.css';

function Analytics() {
  // Состояние данных
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadData();
  }, []);

  // Функция загрузки данных
  const loadData = () => {
    setCategoryData(getByCategory('expense'));
    setMonthlyData(getMonthlySummary(6)); // Последние 6 месяцев
  };

  return (
    <div>
      <h1 className={styles.title}>Аналитика</h1>

      {/* Сетка графиков */}
      <div className={styles.chartsGrid}>
        {/* Круговая диаграмма категорий расходов */}
        <div className={styles.chartContainer}>
          <PieChart
            data={categoryData}
            title="Расходы по категориям"
          />
        </div>

        {/* Столбчатый график доходов/расходов по месяцам */}
        <div className={styles.chartContainer}>
          <BarChart
            data={monthlyData}
            title="Доходы и расходы по месяцам"
          />
        </div>
      </div>
    </div>
  );
}

export default Analytics;