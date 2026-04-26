import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as bcrypt from 'bcrypt'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

const STOCKS = [
  { code: '2330', name: '台積電', nameAlias: 'TSMC', sector: '半導體', isEtf: false, pe: 28.4, marketCap: BigInt('28100000000000') },
  { code: '2454', name: '聯發科', nameAlias: null, sector: '半導體', isEtf: false, pe: 18.2, marketCap: BigInt('1300000000000') },
  { code: '2379', name: '瑞昱', nameAlias: null, sector: '半導體', isEtf: false, pe: 15.6, marketCap: BigInt('245000000000') },
  { code: '2308', name: '台達電', nameAlias: null, sector: '電子', isEtf: false, pe: 22.1, marketCap: BigInt('896000000000') },
  { code: '3008', name: '大立光', nameAlias: null, sector: '光學', isEtf: false, pe: 35.2, marketCap: BigInt('381000000000') },
  { code: '2303', name: '聯電', nameAlias: null, sector: '半導體', isEtf: false, pe: 9.8, marketCap: BigInt('657000000000') },
  { code: '2412', name: '中華電', nameAlias: null, sector: '電信', isEtf: false, pe: 22.5, marketCap: BigInt('740000000000') },
  { code: '3045', name: '台灣大', nameAlias: null, sector: '電信', isEtf: false, pe: 20.1, marketCap: BigInt('320000000000') },
  { code: '4904', name: '遠傳', nameAlias: null, sector: '電信', isEtf: false, pe: 18.5, marketCap: BigInt('280000000000') },
  { code: '2881', name: '富邦金', nameAlias: null, sector: '金融', isEtf: false, pe: 12.4, marketCap: BigInt('1200000000000') },
  { code: '2882', name: '國泰金', nameAlias: null, sector: '金融', isEtf: false, pe: 11.8, marketCap: BigInt('980000000000') },
  { code: '2880', name: '華南金', nameAlias: null, sector: '金融', isEtf: false, pe: 13.2, marketCap: BigInt('480000000000') },
  { code: '2884', name: '玉山金', nameAlias: null, sector: '金融', isEtf: false, pe: 14.5, marketCap: BigInt('420000000000') },
  { code: '2886', name: '兆豐金', nameAlias: null, sector: '金融', isEtf: false, pe: 12.8, marketCap: BigInt('620000000000') },
  { code: '2891', name: '中信金', nameAlias: null, sector: '金融', isEtf: false, pe: 11.2, marketCap: BigInt('780000000000') },
  { code: '2892', name: '第一金', nameAlias: null, sector: '金融', isEtf: false, pe: 13.5, marketCap: BigInt('340000000000') },
  { code: '2301', name: '光寶科', nameAlias: null, sector: '電子', isEtf: false, pe: 12.6, marketCap: BigInt('160000000000') },
  { code: '2382', name: '廣達', nameAlias: null, sector: '電子', isEtf: false, pe: 18.3, marketCap: BigInt('780000000000') },
  { code: '2317', name: '鴻海', nameAlias: 'Foxconn', sector: '電子', isEtf: false, pe: 10.5, marketCap: BigInt('1650000000000') },
  { code: '2357', name: '華碩', nameAlias: 'ASUS', sector: '電子', isEtf: false, pe: 14.2, marketCap: BigInt('280000000000') },
  { code: '2324', name: '仁寶', nameAlias: null, sector: '電子', isEtf: false, pe: 8.5, marketCap: BigInt('85000000000') },
  { code: '1101', name: '台泥', nameAlias: null, sector: '水泥', isEtf: false, pe: 15.8, marketCap: BigInt('120000000000') },
  { code: '1102', name: '亞泥', nameAlias: null, sector: '水泥', isEtf: false, pe: 14.2, marketCap: BigInt('95000000000') },
  { code: '1301', name: '台塑', nameAlias: null, sector: '塑化', isEtf: false, pe: 18.5, marketCap: BigInt('580000000000') },
  { code: '1303', name: '南亞', nameAlias: null, sector: '塑化', isEtf: false, pe: 16.8, marketCap: BigInt('430000000000') },
  { code: '1326', name: '台化', nameAlias: null, sector: '塑化', isEtf: false, pe: 15.2, marketCap: BigInt('320000000000') },
  { code: '2002', name: '中鋼', nameAlias: null, sector: '鋼鐵', isEtf: false, pe: 11.5, marketCap: BigInt('310000000000') },
  { code: '1216', name: '統一', nameAlias: null, sector: '食品', isEtf: false, pe: 22.8, marketCap: BigInt('280000000000') },
  { code: '1207', name: '大成', nameAlias: null, sector: '食品', isEtf: false, pe: 18.5, marketCap: BigInt('45000000000') },
  { code: '2207', name: '和泰車', nameAlias: null, sector: '汽車', isEtf: false, pe: 16.2, marketCap: BigInt('180000000000') },
  { code: '2105', name: '正新', nameAlias: null, sector: '橡膠', isEtf: false, pe: 14.8, marketCap: BigInt('120000000000') },
  { code: '9904', name: '寶成', nameAlias: null, sector: '紡織', isEtf: false, pe: 12.5, marketCap: BigInt('75000000000') },
  { code: '2912', name: '統一超', nameAlias: '7-Eleven', sector: '零售', isEtf: false, pe: 28.5, marketCap: BigInt('380000000000') },
  { code: '2801', name: '彰銀', nameAlias: null, sector: '金融', isEtf: false, pe: 14.2, marketCap: BigInt('150000000000') },
  { code: '5871', name: '中租-KY', nameAlias: null, sector: '金融', isEtf: false, pe: 9.8, marketCap: BigInt('185000000000') },
  { code: '6505', name: '台塑化', nameAlias: null, sector: '塑化', isEtf: false, pe: 12.5, marketCap: BigInt('420000000000') },
  { code: '2498', name: '宏達電', nameAlias: 'HTC', sector: '電子', isEtf: false, pe: null, marketCap: BigInt('25000000000') },
  { code: '3481', name: '群創', nameAlias: null, sector: '光電', isEtf: false, pe: 8.2, marketCap: BigInt('120000000000') },
  { code: '2474', name: '可成', nameAlias: null, sector: '電子', isEtf: false, pe: 15.8, marketCap: BigInt('95000000000') },
  { code: '2395', name: '研華', nameAlias: null, sector: '電子', isEtf: false, pe: 32.5, marketCap: BigInt('145000000000') },
  { code: '0050', name: '元大台灣50', nameAlias: 'ETF50', sector: 'ETF', isEtf: true, pe: null, marketCap: null },
  { code: '0056', name: '元大高股息', nameAlias: '高股息ETF', sector: 'ETF', isEtf: true, pe: null, marketCap: null },
  { code: '00878', name: '國泰永續高股息', nameAlias: '永續高息', sector: 'ETF', isEtf: true, pe: null, marketCap: null },
  { code: '00919', name: '群益台灣精選高息', nameAlias: '月配息ETF', sector: 'ETF', isEtf: true, pe: null, marketCap: null },
  { code: '00929', name: '復華台灣科技優息', nameAlias: null, sector: 'ETF', isEtf: true, pe: null, marketCap: null },
  { code: '00900', name: '富邦特選高股息30', nameAlias: null, sector: 'ETF', isEtf: true, pe: null, marketCap: null },
  { code: '006208', name: '富邦台灣50', nameAlias: null, sector: 'ETF', isEtf: true, pe: null, marketCap: null },
  { code: '00692', name: '富邦公司治理', nameAlias: null, sector: 'ETF', isEtf: true, pe: null, marketCap: null },
  { code: '00713', name: '元大台灣高息低波', nameAlias: null, sector: 'ETF', isEtf: true, pe: null, marketCap: null },
  { code: '00940', name: '元大台灣價值高息', nameAlias: null, sector: 'ETF', isEtf: true, pe: null, marketCap: null },
]

interface DividendTemplate {
  freq: string
  periods: number
  baseCash: number
  growth: number
  startYear: number
}

const DIVIDEND_TEMPLATES: Record<string, DividendTemplate> = {
  '2330': { freq: 'quarterly', periods: 4, baseCash: 6.0, growth: 0.115, startYear: 2016 },
  '2454': { freq: 'annual', periods: 1, baseCash: 30.0, growth: 0.08, startYear: 2016 },
  '2379': { freq: 'annual', periods: 1, baseCash: 12.0, growth: 0.06, startYear: 2016 },
  '2308': { freq: 'annual', periods: 1, baseCash: 6.5, growth: 0.04, startYear: 2016 },
  '3008': { freq: 'annual', periods: 1, baseCash: 45.0, growth: 0.02, startYear: 2016 },
  '2303': { freq: 'annual', periods: 1, baseCash: 2.5, growth: 0.03, startYear: 2016 },
  '2412': { freq: 'annual', periods: 1, baseCash: 4.0, growth: 0.018, startYear: 2016 },
  '3045': { freq: 'annual', periods: 1, baseCash: 3.5, growth: 0.015, startYear: 2016 },
  '4904': { freq: 'annual', periods: 1, baseCash: 3.2, growth: 0.012, startYear: 2016 },
  '2881': { freq: 'annual', periods: 1, baseCash: 1.8, growth: 0.05, startYear: 2016 },
  '2882': { freq: 'annual', periods: 1, baseCash: 1.6, growth: 0.045, startYear: 2016 },
  '2880': { freq: 'annual', periods: 1, baseCash: 0.9, growth: 0.03, startYear: 2016 },
  '2884': { freq: 'annual', periods: 1, baseCash: 0.65, growth: 0.04, startYear: 2016 },
  '2886': { freq: 'annual', periods: 1, baseCash: 1.2, growth: 0.03, startYear: 2016 },
  '2891': { freq: 'annual', periods: 1, baseCash: 0.55, growth: 0.04, startYear: 2016 },
  '2892': { freq: 'annual', periods: 1, baseCash: 0.95, growth: 0.025, startYear: 2016 },
  '1216': { freq: 'annual', periods: 1, baseCash: 2.2, growth: 0.03, startYear: 2016 },
  '2207': { freq: 'annual', periods: 1, baseCash: 10.0, growth: 0.04, startYear: 2016 },
  '1301': { freq: 'annual', periods: 1, baseCash: 3.5, growth: 0.02, startYear: 2016 },
  '1303': { freq: 'annual', periods: 1, baseCash: 3.0, growth: 0.02, startYear: 2016 },
  '2002': { freq: 'annual', periods: 1, baseCash: 1.2, growth: 0.025, startYear: 2016 },
  '2317': { freq: 'annual', periods: 1, baseCash: 4.0, growth: 0.03, startYear: 2016 },
  '0056': { freq: 'quarterly', periods: 4, baseCash: 0.6, growth: 0.05, startYear: 2016 },
  '00878': { freq: 'quarterly', periods: 4, baseCash: 0.35, growth: 0.08, startYear: 2021 },
  '00919': { freq: 'monthly', periods: 12, baseCash: 0.09, growth: 0.06, startYear: 2022 },
  '00929': { freq: 'monthly', periods: 12, baseCash: 0.08, growth: 0.05, startYear: 2023 },
  '0050': { freq: 'semi-annual', periods: 2, baseCash: 2.5, growth: 0.06, startYear: 2016 },
}

function makeExDate(year: number, freq: string, period: number): Date {
  if (freq === 'annual') return new Date(year, 6, 15)
  if (freq === 'semi-annual') return period === 1 ? new Date(year, 2, 20) : new Date(year, 8, 20)
  if (freq === 'quarterly') {
    const months = [2, 5, 8, 11]
    return new Date(year, months[period - 1], 20)
  }
  if (freq === 'monthly') return new Date(year, period - 1, 16)
  return new Date(year, 6, 15)
}

function makePayDate(exDate: Date): Date {
  const pay = new Date(exDate)
  pay.setMonth(pay.getMonth() + 3)
  return pay
}

function makeSeedPrices(stockCode: string, startPrice: number) {
  const prices: { stockCode: string; date: Date; open: number; high: number; low: number; close: number; volume: bigint }[] = []
  const today = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - 6)

  let price = startPrice
  const current = new Date(start)
  while (current <= today) {
    const rng = Math.sin(prices.length * 2.3 + startPrice) * 0.5 + 0.5
    price *= 1 + (rng - 0.48) * 0.018
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      prices.push({
        stockCode,
        date: new Date(current),
        open: parseFloat((price * 0.998).toFixed(2)),
        high: parseFloat((price * 1.008).toFixed(2)),
        low: parseFloat((price * 0.992).toFixed(2)),
        close: parseFloat(price.toFixed(2)),
        volume: BigInt(Math.floor(rng * 50000 + 5000)),
      })
    }
    current.setDate(current.getDate() + 1)
  }
  return prices
}

const PRICES_MAP: Record<string, number> = {
  '2330': 1085, '2454': 985, '2379': 480, '2308': 345, '3008': 2850,
  '2303': 52.8, '2412': 110.5, '3045': 68.5, '4904': 55.2,
  '2881': 82.5, '2882': 68.3, '2880': 28.7, '2884': 24.2, '2886': 42.5, '2891': 26.8, '2892': 22.5,
  '1216': 65.5, '2207': 650, '1301': 88.5, '1303': 72.0, '2002': 28.5,
  '2317': 168.5, '1101': 32.45, '1102': 38.5, '1326': 68.5,
  '2382': 285, '2357': 420, '2324': 24.5, '2301': 82.5, '2395': 382,
  '2105': 42.5, '9904': 32.5, '2912': 288, '2801': 18.5, '5871': 285,
  '6505': 92.5, '3481': 15.8, '2474': 182, '2498': 35.5,
  '0056': 43.62, '00878': 22.85, '00919': 23.40, '00929': 21.5,
  '0050': 168.5, '006208': 88.5, '00692': 52.5, '00713': 42.8, '00940': 15.8, '00900': 18.5,
}

async function main() {
  console.log('🌱 Seeding database...')

  // Stocks must be created BEFORE user (watchlist items have FK to stock)
  for (const stock of STOCKS) {
    await prisma.stock.upsert({
      where: { code: stock.code },
      update: stock,
      create: { ...stock, market: 'TWSE' },
    })
  }
  console.log(`✅ Stocks: ${STOCKS.length} 檔`)

  // Test user
  const passwordHash = await bcrypt.hash('password123', 12)
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
                { stockCode: '2884', order: 2 },
              ],
            },
          },
        ],
      },
    },
  })
  console.log(`✅ User: ${user.email}`)

  // Dividends
  let divCount = 0
  const currentYear = new Date().getFullYear()

  for (const [code, tpl] of Object.entries(DIVIDEND_TEMPLATES)) {
    await prisma.dividend.deleteMany({ where: { stockCode: code } })

    for (let year = tpl.startYear; year <= currentYear; year++) {
      const yearIdx = year - tpl.startYear
      const annualCash = tpl.baseCash * Math.pow(1 + tpl.growth, yearIdx)

      for (let period = 1; period <= tpl.periods; period++) {
        const cash = parseFloat((annualCash / tpl.periods).toFixed(2))
        const exDate = makeExDate(year, tpl.freq, period)
        const payDate = makePayDate(exDate)
        const isPast = exDate < new Date()
        const fillDays = isPast ? Math.floor(Math.random() * 20) + 1 : null

        await prisma.dividend.create({
          data: {
            stockCode: code,
            year,
            period,
            freq: tpl.freq,
            cash,
            stockDiv: 0,
            exDate,
            payDate,
            fillDays,
            filled: isPast && fillDays !== null,
          },
        })
        divCount++
      }
    }
  }
  console.log(`✅ Dividends: ${divCount} 筆`)

  // Stock prices (6 months)
  let priceCount = 0
  const priceStocks = Object.keys(PRICES_MAP).slice(0, 15)
  for (const code of priceStocks) {
    await prisma.stockPrice.deleteMany({ where: { stockCode: code } })
    const prices = makeSeedPrices(code, PRICES_MAP[code])
    for (const p of prices) {
      await prisma.stockPrice.create({ data: p })
    }
    priceCount += prices.length
  }
  console.log(`✅ Prices: ${priceCount} 筆（15 檔 × 6 個月）`)

  console.log('🎉 Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
