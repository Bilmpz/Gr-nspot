interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: string;
  variant?: 'green' | 'red' | 'yellow' | 'neutral' | 'brand';
}

const borderColors: Record<string, string> = {
  brand:   '#16A34A',
  green:   '#16A34A',
  red:     '#EF4444',
  yellow:  '#F59E0B',
  neutral: '#D1D5DB',
};

const valueColors: Record<string, string> = {
  brand:   '#16A34A',
  green:   '#16A34A',
  red:     '#DC2626',
  yellow:  '#B45309',
  neutral: '#111827',
};

export default function MetricCard({ label, value, sub, variant = 'neutral' }: MetricCardProps) {
  return (
    <div
      className="transition-all duration-200 hover:scale-[1.01]"
      style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderLeft: `4px solid ${borderColors[variant]}`,
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <p
        style={{
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#6B7280',
          marginBottom: '8px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: '24px',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          color: valueColors[variant],
          lineHeight: 1.1,
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#9CA3AF',
            marginTop: '4px',
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
