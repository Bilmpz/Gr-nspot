import { useQuery } from '@tanstack/react-query';
import { fetchToday, toKr, formatHour, AREAS } from '../api/api';
import PriceBarChart from '../components/PriceBarChart';
import LoadingSkeleton from '../components/LoadingSkeleton';

interface Props { area: string; }

export default function TodayPage({ area }: Props) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['today', area],
    queryFn: () => fetchToday(area),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <LoadingSkeleton />;

  if (isError) return (
    <div className="text-center py-16">
      <p className="font-medium mb-4" style={{ color: '#EF4444' }}>{(error as Error).message}</p>
      <button
        onClick={() => refetch()}
        style={{
          padding: '10px 24px',
          background: '#16A34A',
          color: 'white',
          borderRadius: '10px',
          fontWeight: 600,
          fontSize: '14px',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Prøv igen
      </button>
    </div>
  );

  const prices = data ?? [];
  const avg = prices.length ? prices.reduce((s, p) => s + p.priceKrPerKwh, 0) / prices.length : 0;

  return (
    <div className="space-y-5">
      {/* Chart card */}
      <div
        style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>Spotpris i dag</h2>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#6B7280',
              background: '#F3F4F6',
              padding: '3px 10px',
              borderRadius: '20px',
            }}
          >
            {AREAS[area]} · {area}
          </span>
        </div>
        <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '16px' }}>
          kr/kWh — stiplet linje er gennemsnit
        </p>
        <PriceBarChart prices={prices} />
      </div>

      {/* Table card */}
      <div
        style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ padding: '12px 20px', borderBottom: '1px solid #F3F4F6' }}
        >
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Alle timer</span>
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>gns. {avg.toFixed(2)} kr/kWh</span>
        </div>
        <table className="w-full" style={{ fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#FAFAF9' }}>
              <th
                className="text-left"
                style={{ padding: '10px 20px', fontWeight: 600, color: '#6B7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
              >
                Time
              </th>
              <th
                className="text-right"
                style={{ padding: '10px 20px', fontWeight: 600, color: '#6B7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
              >
                kr/kWh
              </th>
              <th
                className="text-right hidden sm:table-cell"
                style={{ padding: '10px 20px', fontWeight: 600, color: '#6B7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
              >
                vs. gns.
              </th>
            </tr>
          </thead>
          <tbody>
            {prices.map((p, i) => {
              const kr = toKr(p.priceKrPerKwh);
              const diff = p.priceKrPerKwh - avg;
              const cheap = diff < -0.01;
              const exp = diff > 0.01;
              return (
                <tr
                  key={i}
                  style={{
                    borderTop: '1px solid #F3F4F6',
                    background: cheap ? '#F0FDF4' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#F9FAFB'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = cheap ? '#F0FDF4' : 'transparent'; }}
                >
                  <td style={{ padding: '10px 20px', fontWeight: 500, color: '#374151' }}>
                    Kl. {formatHour(p.hourDK)}
                  </td>
                  <td
                    className="text-right"
                    style={{
                      padding: '10px 20px',
                      fontWeight: 800,
                      fontVariantNumeric: 'tabular-nums',
                      color: cheap ? '#16A34A' : exp ? '#DC2626' : '#111827',
                    }}
                  >
                    {kr.toFixed(2)}
                  </td>
                  <td className="text-right hidden sm:table-cell" style={{ padding: '10px 20px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '20px',
                        background: cheap ? '#DCFCE7' : exp ? '#FEE2E2' : '#F3F4F6',
                        color: cheap ? '#16A34A' : exp ? '#DC2626' : '#6B7280',
                      }}
                    >
                      {diff >= 0 ? '+' : ''}{diff.toFixed(2)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
