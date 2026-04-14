import { useQuery } from '@tanstack/react-query';
import { fetchSummary, toKr, formatHour, AREAS } from '../api/api';
import MetricCard from '../components/MetricCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

interface Props { area: string; }

export default function SummaryPage({ area }: Props) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['summary', area],
    queryFn: () => fetchSummary(area),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <LoadingSkeleton />;

  if (isError) return (
    <div className="text-center py-16">
      <p style={{ color: '#EF4444', fontWeight: 500, marginBottom: '16px' }}>
        {(error as Error).message}
      </p>
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
  );

  if (!data) return null;

  return (
    <div className="space-y-5">
      {/* Header banner */}
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
            marginBottom: '6px',
          }}
        >
          Oversigt
        </p>
        <p style={{ fontSize: '17px', fontWeight: 900, color: 'white' }}>
          {AREAS[area]} ({area}) &middot; {data.date}
        </p>
        <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
          Gennemsnit:{' '}
          <span style={{ color: '#4ADE80', fontWeight: 700 }}>
            {toKr(data.averagePriceKrPerKwh).toFixed(2)} kr/kWh
          </span>
        </p>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Laveste pris"
          value={`${toKr(data.minPriceKrPerKwh).toFixed(2)} kr`}
          sub="kr/kWh"
          variant="green"
        />
        <MetricCard
          label="Højeste pris"
          value={`${toKr(data.maxPriceKrPerKwh).toFixed(2)} kr`}
          sub="kr/kWh"
          variant="red"
        />
        <MetricCard
          label="Billigste time"
          value={`Kl. ${formatHour(data.cheapestHour.hourDK)}`}
          sub={`${toKr(data.cheapestHour.priceKrPerKwh).toFixed(2)} kr/kWh`}
          variant="green"
        />
        <MetricCard
          label="Dyreste time"
          value={`Kl. ${formatHour(data.mostExpensiveHour.hourDK)}`}
          sub={`${toKr(data.mostExpensiveHour.priceKrPerKwh).toFixed(2)} kr/kWh`}
          variant="red"
        />
      </div>

      {/* Below-average stat */}
      <div
        style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '14px',
            background: '#DCFCE7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#16A34A',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {data.hoursBelowAverage}
          </span>
        </div>
        <div>
          <p style={{ fontWeight: 700, color: '#111827', fontSize: '14px' }}>
            {data.hoursBelowAverage} af 24 timer under gennemsnit
          </p>
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '3px' }}>
            Gennemsnit er {toKr(data.averagePriceKrPerKwh).toFixed(2)} kr/kWh
          </p>
        </div>
      </div>
    </div>
  );
}
