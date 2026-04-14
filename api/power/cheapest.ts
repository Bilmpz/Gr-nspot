import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isValidArea, getDKDateStr, fetchDayPrices, calcCheapest } from '../_lib/power';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const area = (req.query.area as string) ?? 'DK1';
  const count = parseInt((req.query.count as string) ?? '5', 10);

  if (!isValidArea(area)) {
    return res.status(400).json({ message: 'area must be DK1 or DK2' });
  }
  if (isNaN(count) || count < 1 || count > 24) {
    return res.status(400).json({ message: 'count must be between 1 and 24' });
  }

  try {
    const dateStr = getDKDateStr(0);
    const prices = await fetchDayPrices(dateStr, area);
    const cheapest = calcCheapest(prices, count);

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');
    return res.status(200).json(cheapest);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ message });
  }
}
