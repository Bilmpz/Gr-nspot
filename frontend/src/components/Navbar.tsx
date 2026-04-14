import { AREAS } from '../api/api';

interface NavbarProps {
  area: string;
}

export default function Navbar({ area }: NavbarProps) {
  return (
    <nav style={{ background: '#0C1B0F' }} className="sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo + Name */}
        <div className="flex items-center gap-3">
          {/* Lightning bolt mark */}
          <div
            style={{ background: '#16A34A', borderRadius: '10px' }}
            className="w-9 h-9 flex items-center justify-center flex-shrink-0"
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
              <path
                d="M11.5 2L4 11h6l-1.5 7L16 8h-6L11.5 2Z"
                fill="white"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="leading-none">
            <span className="block text-white font-black text-lg tracking-tight">GrønSpot</span>
            <span className="block text-[10px] font-medium tracking-widest uppercase mt-0.5" style={{ color: '#4ADE80' }}>
              Dansk elspot
            </span>
          </div>
        </div>

        {/* Area badge — outlined, not filled */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium hidden sm:block" style={{ color: '#4ADE80' }}>Prisområde</span>
          <span
            className="text-sm font-bold px-4 py-1.5 rounded-full"
            style={{ color: 'white', border: '1.5px solid rgba(74,222,128,0.45)' }}
          >
            {AREAS[area]} ({area})
          </span>
        </div>

      </div>
    </nav>
  );
}
