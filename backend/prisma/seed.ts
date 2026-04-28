import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { resolveTwseSeedStocks } from '../src/prisma-seed/twse-seed-universe';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TPEX_DAILY_CLOSE_URL =
  'https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes';
const UA = 'Mozilla/5.0 (compatible; DividendHub/1.0) Seed';

type TpexCloseRow = {
  SecuritiesCompanyCode: string;
  CompanyName: string;
  [key: string]: string;
};

/**
 * 取得 TPEx 上櫃股票清單（用於 seed）
 * @returns 代號與名稱陣列，失敗時回傳空陣列
 */
const fetchTpexStocks = async (): Promise<
  { code: string; name: string; isEtf: boolean }[]
> => {
  try {
    const res = await fetch(TPEX_DAILY_CLOSE_URL, {
      headers: { 'User-Agent': UA },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as TpexCloseRow[];
    const seen = new Set<string>();
    const result: { code: string; name: string; isEtf: boolean }[] = [];
    for (const row of rows) {
      const code = String(row.SecuritiesCompanyCode ?? '').trim();
      const name = String(row.CompanyName ?? '').trim();
      if (!code || !name || seen.has(code)) continue;
      seen.add(code);
      result.push({ code, name, isEtf: /^\d{5,}$/.test(code) });
    }
    return result;
  } catch {
    return [];
  }
};

/**
 * 生成開發環境用假股價（6 個月，週一到週五）
 * @param stockCode 股票代號
 * @param startPrice 起始價格
 * @returns 股價陣列
 */
const makeSeedPrices = (
  stockCode: string,
  startPrice: number,
): {
  stockCode: string;
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: bigint;
}[] => {
  const prices: {
    stockCode: string;
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: bigint;
  }[] = [];
  const today = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 6);

  let price = startPrice;
  const current = new Date(start);
  while (current <= today) {
    const rng = Math.sin(prices.length * 2.3 + startPrice) * 0.5 + 0.5;
    price *= 1 + (rng - 0.48) * 0.018;
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      prices.push({
        stockCode,
        date: new Date(current),
        open: parseFloat((price * 0.998).toFixed(2)),
        high: parseFloat((price * 1.008).toFixed(2)),
        low: parseFloat((price * 0.992).toFixed(2)),
        close: parseFloat(price.toFixed(2)),
        volume: BigInt(Math.floor(rng * 50000 + 5000)),
      });
    }
    current.setDate(current.getDate() + 1);
  }
  return prices;
};

const DEV_PRICE_SEEDS: Record<string, number> = {
  '2330': 1085,
  '2454': 985,
  '0056': 43.62,
  '00878': 22.85,
  '0050': 168.5,
  '2412': 110.5,
  '2882': 68.3,
};

const main = async (): Promise<void> => {
  console.log('🌱 Seeding database...');

  // TWSE 上市股票
  console.log('📥 載入 TWSE 上市股票清單…');
  const { stocks: twseStocks, source, referenceDayYmd } = await resolveTwseSeedStocks();
  console.log(
    `   來源：${source}${referenceDayYmd ? `，行情基準日（台北）：${referenceDayYmd}` : ''}`,
  );

  let twseCount = 0;
  for (const stock of twseStocks) {
    await prisma.stock.upsert({
      where: { code: stock.code },
      update: { name: stock.name, sector: stock.sector, isActive: true },
      create: { ...stock, market: 'TWSE', isActive: true },
    });
    twseCount++;
    if (twseCount % 250 === 0) console.log(`   …TWSE 已 upsert ${twseCount} 檔`);
  }
  console.log(`✅ TWSE Stocks: ${twseCount} 檔`);

  // TPEx 上櫃股票
  console.log('📥 載入 TPEx 上櫃股票清單…');
  const tpexStocks = await fetchTpexStocks();
  let tpexCount = 0;
  for (const stock of tpexStocks) {
    await prisma.stock.upsert({
      where: { code: stock.code },
      update: { name: stock.name, isActive: true },
      create: {
        code: stock.code,
        name: stock.name,
        sector: stock.isEtf ? 'ETF' : '上櫃',
        isEtf: stock.isEtf,
        market: 'TPEX',
        isActive: true,
      },
    });
    tpexCount++;
    if (tpexCount % 250 === 0) console.log(`   …TPEx 已 upsert ${tpexCount} 檔`);
  }
  console.log(`✅ TPEx Stocks: ${tpexCount} 檔`);

  // 測試使用者
  const passwordHash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: '存股族',
      passwordHash,
      settings: { create: {} },
      watchlistGroups: {
        create: [
          {
            name: '核心',
            color: '#22c55e',
            order: 0,
            items: {
              create: [
                { stockCode: '2330', order: 0 },
                { stockCode: '2412', order: 1 },
                { stockCode: '0056', order: 2 },
              ],
            },
          },
          {
            name: '高股息 ETF',
            color: '#60a5fa',
            order: 1,
            items: {
              create: [
                { stockCode: '00878', order: 0 },
                { stockCode: '00919', order: 1 },
              ],
            },
          },
          {
            name: '觀察中',
            color: '#f59e0b',
            order: 2,
            items: {
              create: [
                { stockCode: '2454', order: 0 },
                { stockCode: '2882', order: 1 },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ User: ${user.email}`);

  // 開發環境假股價（少量、用於 Dashboard 展示）
  let priceCount = 0;
  for (const [code, startPrice] of Object.entries(DEV_PRICE_SEEDS)) {
    await prisma.stockPrice.deleteMany({ where: { stockCode: code } });
    const prices = makeSeedPrices(code, startPrice);
    for (const p of prices) {
      await prisma.stockPrice.create({ data: p });
    }
    priceCount += prices.length;
  }
  console.log(`✅ Dev prices: ${priceCount} 筆（${Object.keys(DEV_PRICE_SEEDS).length} 檔 × 6 個月）`);
  console.log('ℹ️  配息資料：請執行 POST /data-sync/backfill-dividends?fromYear=2003 取得真實資料');

  console.log('🎉 Seed complete!');
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
