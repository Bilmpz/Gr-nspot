import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  Cell, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { type HourlyPrice, toKr, formatHour } from '../api/api';

interface Props {
  prices: HourlyPrice[];
  highlightStart?: string;
  highlightEnd?: string;
}

function getColor(ratio: number, highlighted: boolean): string {
  if (highlighted) return '#16A34A';
  if (ratio < 0.33) return '#4ADE80';
  if (ratio < 0.67) return '#FACC15';
  return '#F87171';
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '10px',
        padding: '8px 12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        fontSize: '13px',
      }}
    >
      <p style={{ fontWeight: 700, color: '#111827', marginBottom: '2px' }}>Kl. {label}</p>
      <p style={{ color: '#374151', fontWeight: 600 }}>{payload[0].value.toFixed(2)} kr/kWh</p>
    </div>
  );
}

export default function PriceBarChart({ prices, highlightStart, highlightEnd }: Props) {
  if (prices.length === 0) return null;

  const data = prices.map((p) => ({
    hour: formatHour(p.hourDK),
    price: toKr(p.priceKrPerKwh),
    raw: p,
  }));

  const values = data.map((d) => d.price);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const range = max - min || 1;

  const isHighlighted = (raw: HourlyPrice) => {
    if (!highlightStart || !highlightEnd) return false;
    return raw.hourDK >= highlightStart && raw.hourDK <= highlightEnd;
  };

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 4, left: -8, bottom: 0 }}>
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 10, fill: '#9CA3AF' }}
          tickLine={false}
          axisLine={false}
          interval={3}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#9CA3AF' }}
          tickFormatter={(v) => `${v.toFixed(2)}`}
          tickLine={false}
          axisLine={false}
          width={38}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6', radius: 4 }} />
        <ReferenceLine
          y={Math.round(avg * 100) / 100}
          stroke="#D1D5DB"
          strokeDasharray="4 3"
          strokeWidth={1.5}
        />
        <Bar dataKey="price" radius={[4, 4, 0, 0]} maxBarSize={28}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={getColor((entry.price - min) / range, isHighlighted(entry.raw))}
              opacity={0.9}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
