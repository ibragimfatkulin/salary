import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

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
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        padding: '12px 16px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontWeight: 600, marginBottom: '8px', color: '#111827' }}>
          {label}
        </div>
        {payload.map((entry, index) => (
          <div key={index} style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '2px',
              backgroundColor: entry.color
            }} />
            <span style={{ color: '#6b7280', fontSize: '14px' }}>
              {entry.name}:
            </span>
            <span style={{ fontWeight: 600, color: entry.color }}>
              {formatAmount(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function BarChart({ data, title }) {
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
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
        <div style={{ fontSize: '16px' }}>
          Нет данных для отображения
        </div>
        <div style={{ fontSize: '14px', marginTop: '8px' }}>
          Добавьте операции, чтобы увидеть график
        </div>
      </div>
    );
  }

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
        <RechartsBarChart
          data={items}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            stroke="#6b7280"
            style={{ fontSize: '14px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '14px' }}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
              return value;
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => (
              <span style={{ color: '#111827', fontSize: '14px' }}>
                {value}
              </span>
            )}
          />
          <Bar
            dataKey="income"
            name="Доходы"
            fill="#10b981"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="expense"
            name="Расходы"
            fill="#ef4444"
            radius={[8, 8, 0, 0]}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChart;