import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBestWindow, fetchToday, toKr, formatHour } from '../api/api';
import PriceBarChart from '../components/PriceBarChart';
import LoadingSkeleton from '../components/LoadingSkeleton';

interface Props { area: string; }

export default function BestWindowPage({ area }: Props) {
  const [duration, setDuration] = useState(3);

  const { data: win, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['best-window', area, duration],
    queryFn: () => fetchBestWindow(area, duration),
    staleTime: 5 * 60 * 1000,
  });

  const { data: todayPrices } = useQuery({
    queryKey: ['today', area],
    queryFn: () => fetchToday(area),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-5">
      {/* Duration slider */}
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
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Vinduesvarighed</label>
          <span
            style={{
              background: '#16A34A',
              color: 'white',
              fontSize: '13px',
              fontWeight: 800,
              padding: '5px 14px',
              borderRadius: '10px',
              boxShadow: '0 1px 4px rgba(22,163,74,0.3)',
            }}
          >
            {duration} {duration === 1 ? 'time' : 'timer'}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={8}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full cursor-pointer"
          style={{ accentColor: '#16A34A' }}
        />
        <div className="flex justify-between" style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px' }}>
          <span>1 time</span>
          <span>8 timer</span>
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

      {win && (
        <>
          {/* Result banner */}
          <div
            style={{
              background: '#0C1B0F',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(12,27,15,0.2)',
            }}
          >
            <p
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#4ADE80',
                marginBottom: '14px',
              }}
            >
              Bedste {duration}-timers vindue i dag
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p style={{ color: '#6B7280', fontSize: '11px', marginBottom: '4px' }}>Start</p>
                <p style={{ fontSize: '22px', fontWeight: 900, color: 'white' }}>
                  Kl. {formatHour(win.startHour)}
                </p>
              </div>
              <div>
                <p style={{ color: '#6B7280', fontSize: '11px', marginBottom: '4px' }}>Slut</p>
                <p style={{ fontSize: '22px', fontWeight: 900, color: 'white' }}>
                  Kl. {formatHour(win.endHour)}
                </p>
              </div>
              <div>
                <p style={{ color: '#6B7280', fontSize: '11px', marginBottom: '4px' }}>Gns. pris</p>
                <p style={{ fontSize: '22px', fontWeight: 900, color: '#4ADE80' }}>
                  {toKr(win.averagePriceKrPerKwh).toFixed(2)}
                </p>
                <p style={{ color: '#6B7280', fontSize: '11px' }}>kr/kWh</p>
              </div>
            </div>
          </div>

          {/* Chart with highlight */}
          {todayPrices && (
            <div
              style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                Alle timer — vinduet er markeret grønt
              </p>
              <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '16px' }}>kr/kWh</p>
              <PriceBarChart
                prices={todayPrices}
                highlightStart={win.startHour}
                highlightEnd={win.endHour}
              />
            </div>
          )}

          {/* Hours in window */}
          <div
            style={{
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #F3F4F6' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Timer i vinduet</p>
            </div>
            <table className="w-full" style={{ fontSize: '13px' }}>
              <tbody>
                {win.hours.map((p, i) => (
                  <tr
                    key={i}
                    style={{ borderTop: i > 0 ? '1px solid #F3F4F6' : 'none' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#F9FAFB'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '12px 20px', fontWeight: 500, color: '#374151' }}>
                      Kl. {formatHour(p.hourDK)}
                    </td>
                    <td
                      className="text-right"
                      style={{
                        padding: '12px 20px',
                        fontWeight: 900,
                        color: '#16A34A',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {toKr(p.priceKrPerKwh).toFixed(2)} kr/kWh
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
