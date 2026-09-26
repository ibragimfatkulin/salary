import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Палитра цветов по умолчанию
const DEFAULT_COLORS = [
  '#2563eb', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

// Форматирование суммы для tooltip
const formatAmount = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value ?? 0);
};

// Кастомный tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div style={{
        backgroundColor: '#ffffff',
        padding: '8px 12px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>
          {data.name}
        </div>
        <div style={{ color: data.payload?.color || '#2563eb' }}>
          {formatAmount(data.value)}
        </div>
      </div>
    );
  }
  return null;
};

function PieChart({ data, title }) {
  // Fallback для data
  const items = data || [];

  // Если данных нет — показываем заглушку
  if (items.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        color: '#9ca3af',
        textAlign: 'center',
        padding: '24px'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🥧</div>
        <div style={{ fontSize: '16px' }}>
          Нет данных для отображения
        </div>
        <div style={{ fontSize: '14px', marginTop: '8px' }}>
          Добавьте операции, чтобы увидеть диаграмму
        </div>
      </div>
    );
  }

  // Подсчёт общей суммы для процентов
  const total = items.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div>
      {title && (
        <div style={{
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '16px',
          color: '#111827'
        }}>
          {title}
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={items}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={(entry) => {
              if (total === 0) return '';
              const percent = ((entry.value / total) * 100).toFixed(0);
              return `${percent}%`;
            }}
          >
            {items.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span style={{ color: '#111827', fontSize: '14px' }}>
                {value}
              </span>
            )}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PieChart;