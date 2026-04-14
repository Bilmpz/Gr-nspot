import { useQuery } from '@tanstack/react-query';
import { fetchTomorrow, toKr, formatHour, AREAS } from '../api/api';
import PriceBarChart from '../components/PriceBarChart';
import LoadingSkeleton from '../components/LoadingSkeleton';

interface Props { area: string; }

export default function TomorrowPage({ area }: Props) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tomorrow', area],
    queryFn: () => fetchTomorrow(area),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <LoadingSkeleton />;

  if (isError) {
    const msg = (error as Error).message;
    const notReady = msg.toLowerCase().includes('not yet') || msg.toLowerCase().includes('13:00');
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: '#F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
            <circle cx="12" cy="12" r="9" stroke="#9CA3AF" strokeWidth="1.5" />
            <path d="M12 7v5l3 3" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        {notReady ? (
          <>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
              Morgendagens priser er ikke klar
            </h3>
            <p style={{ color: '#6B7280', fontSize: '13px', maxWidth: '280px' }}>
              Nord Pool offentliggør priserne normalt efter kl. 13:00 CET
            </p>
          </>
        ) : (
          <p style={{ color: '#EF4444', fontWeight: 500, marginBottom: '16px' }}>{msg}</p>
        )}
        <button
          onClick={() => refetch()}
          style={{
            marginTop: '20px',
            padding: '10px 24px',
            background: '#16A34A',
            color: 'white',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '13px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Tjek igen
        </button>
      </div>
    );
  }

  const prices = data ?? [];
  const avg = prices.length ? prices.reduce((s, p) => s + p.priceKrPerKwh, 0) / prices.length : 0;

  return (
    <div className="space-y-5">
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
          <h2 style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>Spotpris i morgen</h2>
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
            </tr>
          </thead>
          <tbody>
            {prices.map((p, i) => {
              const kr = toKr(p.priceKrPerKwh);
              const cheap = p.priceKrPerKwh < avg - 0.01;
              const exp = p.priceKrPerKwh > avg + 0.01;
              return (
                <tr
                  key={i}
                  style={{ borderTop: '1px solid #F3F4F6' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#F9FAFB'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
