import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCheapest, toKr, formatHour } from '../api/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

interface Props { area: string; }

export default function CheapestPage({ area }: Props) {
  const [count, setCount] = useState(5);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['cheapest', area, count],
    queryFn: () => fetchCheapest(area, count),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-5">
      {/* Slider control */}
      <div
        style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
            Antal billige timer
          </label>
          <span
            style={{
              background: '#16A34A',
              color: 'white',
              fontSize: '14px',
              fontWeight: 900,
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 4px rgba(22,163,74,0.3)',
            }}
          >
            {count}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full cursor-pointer"
          style={{ accentColor: '#16A34A' }}
        />
        <div className="flex justify-between" style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px' }}>
          <span>1 time</span>
          <span>10 timer</span>
        </div>
      </div>

      {isLoading && <LoadingSkeleton />}

      {isError && (
        <div className="text-center py-10">
          <p style={{ color: '#EF4444', marginBottom: '16px' }}>{(error as Error).message}</p>
          <button
            onClick={() => refetch()}
            style={{
              padding: '10px 24px',
              background: '#16A34A',
              color: 'white',
              borderRadius: '10px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Prøv igen
          </button>
        </div>
      )}

      {data && (
        <div className="space-y-2">
          {data.map((p, i) => {
            const kr = toKr(p.priceKrPerKwh);
            return (
              <div
                key={i}
                className="flex items-center gap-4"
                style={{
                  background: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#16A34A'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#E5E7EB'; }}
              >
                {/* Rank badge */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: i === 0 ? '#16A34A' : '#F3F4F6',
                    color: i === 0 ? 'white' : '#6B7280',
                    fontSize: '13px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, color: '#111827', fontSize: '15px' }}>
                    Kl. {formatHour(p.hourDK)}
                  </p>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>
                    {p.priceArea}
                  </p>
                </div>
                <div className="text-right">
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#16A34A', fontVariantNumeric: 'tabular-nums' }}>
                    {kr.toFixed(2)}
                  </span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '4px' }}>kr/kWh</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
