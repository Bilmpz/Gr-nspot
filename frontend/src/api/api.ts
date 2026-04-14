export interface HourlyPrice {
  hourDK: string;
  priceKrPerKwh: number;
  priceArea: string;
}

export interface BestWindow {
  startHour: string;
  endHour: string;
  durationHours: number;
  averagePriceKrPerKwh: number;
  hours: HourlyPrice[];
}

export interface PriceSummary {
  minPriceKrPerKwh: number;
  maxPriceKrPerKwh: number;
  averagePriceKrPerKwh: number;
  cheapestHour: HourlyPrice;
  mostExpensiveHour: HourlyPrice;
  hoursBelowAverage: number;
  priceArea: string;
  date: string;
}

export const AREAS: Record<string, string> = {
  DK1: 'Vest',
  DK2: 'Øst',
};

// Format kr/kWh to 2 decimals, e.g. "0.86 kr/kWh"
export const toKr = (kr: number) => Math.round(kr * 100) / 100;

// Format hour string from "2024-01-15T14:00:00" to "14:00"
export const formatHour = (hourDK: string) => {
  const d = new Date(hourDK);
  return `${String(d.getHours()).padStart(2, '0')}:00`;
};

const BASE = '/api/power';

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const fetchToday = (area: string): Promise<HourlyPrice[]> =>
  apiFetch(`${BASE}/today?area=${area}`);

export const fetchTomorrow = (area: string): Promise<HourlyPrice[]> =>
  apiFetch(`${BASE}/tomorrow?area=${area}`);

export const fetchCheapest = (area: string, count: number): Promise<HourlyPrice[]> =>
  apiFetch(`${BASE}/cheapest?area=${area}&count=${count}`);

export const fetchBestWindow = (area: string, durationHours: number): Promise<BestWindow> =>
  apiFetch(`${BASE}/best-window?area=${area}&durationHours=${durationHours}`);

export const fetchSummary = (area: string): Promise<PriceSummary> =>
  apiFetch(`${BASE}/summary?area=${area}`);
