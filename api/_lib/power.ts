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

export function isValidArea(area: string): boolean {
  return area === 'DK1' || area === 'DK2';
}

/** Returns today's (or +offsetDays) date as YYYY-MM-DD in Copenhagen timezone */
export function getDKDateStr(offsetDays = 0): string {
  const date = new Date();
  date.setTime(date.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  return date.toLocaleDateString('sv-SE', { timeZone: 'Europe/Copenhagen' });
}

interface DayAheadRecord {
  TimeDK: string;
  DayAheadPriceDKK: number;
  PriceArea: string;
}

/**
 * Fetches hourly electricity prices from Energi Data Service for the given date and area.
 * DayAheadPrices returns 15-min intervals; only top-of-hour records (minute == 00) are kept.
 */
export async function fetchDayPrices(dateStr: string, area: string): Promise<HourlyPrice[]> {
  const filter = encodeURIComponent(JSON.stringify({ PriceArea: area }));
  const url = `https://api.energidataservice.dk/dataset/DayAheadPrices?start=${dateStr}T00:00&end=${dateStr}T23:59&filter=${filter}&limit=200`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Energi Data Service returned ${response.status}`);
  }

  const data = await response.json() as { records: DayAheadRecord[] };
  const records: DayAheadRecord[] = data.records ?? [];

  // Keep only top-of-hour records by parsing the minute from "YYYY-MM-DDTHH:MM:SS"
  const hourly = records
    .filter(r => {
      const timePart = r.TimeDK.split('T')[1] ?? '';
      const minute = timePart.split(':')[1] ?? '';
      return minute === '00';
    })
    .sort((a, b) => a.TimeDK.localeCompare(b.TimeDK))
    .map(r => ({
      hourDK: r.TimeDK,
      // Convert DKK/MWh → kr/kWh, rounded to 4 decimal places
      priceKrPerKwh: Math.round((r.DayAheadPriceDKK / 1000) * 10000) / 10000,
      priceArea: r.PriceArea,
    }));

  return hourly;
}

export function calcCheapest(prices: HourlyPrice[], count: number): HourlyPrice[] {
  return [...prices].sort((a, b) => a.priceKrPerKwh - b.priceKrPerKwh).slice(0, count);
}

export function calcBestWindow(prices: HourlyPrice[], durationHours: number): BestWindow {
  const list = [...prices];
  const n = Math.min(durationHours, list.length);

  let windowSum = list.slice(0, n).reduce((s, p) => s + p.priceKrPerKwh, 0);
  let minSum = windowSum;
  let bestStart = 0;

  for (let i = 1; i <= list.length - n; i++) {
    windowSum = windowSum - list[i - 1].priceKrPerKwh + list[i + n - 1].priceKrPerKwh;
    if (windowSum < minSum) {
      minSum = windowSum;
      bestStart = i;
    }
  }

  const windowHours = list.slice(bestStart, bestStart + n);
  const avg = windowHours.reduce((s, p) => s + p.priceKrPerKwh, 0) / n;

  return {
    startHour: windowHours[0].hourDK,
    endHour: windowHours[windowHours.length - 1].hourDK,
    durationHours: n,
    averagePriceKrPerKwh: Math.round(avg * 10000) / 10000,
    hours: windowHours,
  };
}

export function calcSummary(prices: HourlyPrice[], area: string, dateStr: string): PriceSummary {
  const avg = prices.reduce((s, p) => s + p.priceKrPerKwh, 0) / prices.length;
  const sorted = [...prices].sort((a, b) => a.priceKrPerKwh - b.priceKrPerKwh);

  return {
    minPriceKrPerKwh: sorted[0].priceKrPerKwh,
    maxPriceKrPerKwh: sorted[sorted.length - 1].priceKrPerKwh,
    averagePriceKrPerKwh: Math.round(avg * 10000) / 10000,
    cheapestHour: sorted[0],
    mostExpensiveHour: sorted[sorted.length - 1],
    hoursBelowAverage: prices.filter(p => p.priceKrPerKwh < avg).length,
    priceArea: area,
    date: dateStr,
  };
}
