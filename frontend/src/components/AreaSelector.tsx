interface AreaSelectorProps {
  area: string;
  onChange: (area: string) => void;
}

const AREA_LABELS: Record<string, { name: string; code: string }> = {
  DK1: { name: 'Vest', code: 'DK1' },
  DK2: { name: 'Øst', code: 'DK2' },
};

export default function AreaSelector({ area, onChange }: AreaSelectorProps) {
  return (
    <div
      className="flex items-center p-1"
      style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {Object.entries(AREA_LABELS).map(([code, { name }]) => {
        const isActive = area === code;
        return (
          <button
            key={code}
            onClick={() => onChange(code)}
            className="transition-all duration-200"
            style={{
              padding: '8px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: isActive ? '#16A34A' : 'transparent',
              color: isActive ? 'white' : '#374151',
              boxShadow: isActive ? '0 1px 4px rgba(22,163,74,0.25)' : 'none',
            }}
          >
            <span style={{ display: 'block', fontWeight: 700, fontSize: '14px', lineHeight: 1.2 }}>
              {name}
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.05em',
                marginTop: '1px',
                opacity: isActive ? 0.75 : 0.5,
              }}
            >
              {code}
            </span>
          </button>
        );
      })}
    </div>
  );
}
