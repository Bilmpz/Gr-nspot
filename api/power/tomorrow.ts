import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isValidArea, getDKDateStr, fetchDayPrices } from '../_lib/power';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const area = (req.query.area as string) ?? 'DK1';

  if (!isValidArea(area)) {
    return res.status(400).json({ message: 'area must be DK1 or DK2' });
  }

  try {
    const dateStr = getDKDateStr(1);
    const prices = await fetchDayPrices(dateStr, area);

    if (prices.length === 0) {
      return res.status(404).json({
        message: "Tomorrow's prices are not yet published. They are usually available after 13:00 CET.",
      });
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(prices);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ message });
  }
}
