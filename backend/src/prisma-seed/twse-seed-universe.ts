import { readFile } from 'node:fs/promises';
import type { TwseSeedStockRow } from './twse-seed-universe.types';

/** TWSE 全日行情 JSON（與 `StockPriceSyncService` 所用一致） */
type TwseDayAllResponse = {
  stat: string;
  date?: string;
  data?: string[][];
};

/** OpenAPI 上市公司基本資料（節錄） */
type TwseCompanyRow = {
  公司代號: string;
  公司簡稱: string;
};

/** OpenAPI 產業別對照（節錄） */
type TwseIndustryRow = {
  公司代號: string;
  產業別: string;
};

const TWSE_DAY_ALL =
  'https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY_ALL';
const OPENAPI_COMPANIES = 'https://openapi.twse.com.tw/v1/opendata/t187ap03_L';
const OPENAPI_INDUSTRIES = 'https://openapi.twse.com.tw/v1/opendata/t187ap05_L';

const UA =
  'Mozilla/5.0 (compatible; DividendHub/1.0; +https://github.com/) TwseSeedUniverse';

/** 線上 seed 時對 TWSE／OpenAPI 連續請求間隔（毫秒），與回填節流同一數量級 */
const SEED_TWSE_HTTP_GAP_MS = 350;

/**
 * 節流用延遲
 * @returns {Promise<void>} 於 `SEED_TWSE_HTTP_GAP_MS` 後 resolve
 */
const sleepTwseThrottle = (): Promise<void> =>
  new Promise((r) => setTimeout(r, SEED_TWSE_HTTP_GAP_MS));

/**
 * 將時間轉為台北當日日曆分量
 * @param d 參考時間
 * @returns 西元年、月、日
 */
const getYmdInTaipei = (d: Date): { y: number; m: number; day: number } => {
  const s = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
  const [y, m, day] = s.split('-').map((x) => parseInt(x, 10));
  return { y, m, day };
};

/**
 * 格式化為 TWSE `STOCK_DAY_ALL` 所需之 YYYYMMDD（台北日曆）
 * @param date 參考時間
 * @returns YYYYMMDD 字串
 */
const formatDateTwse = (date: Date): string => {
  const { y, m, day } = getYmdInTaipei(date);
  return `${y}${String(m).padStart(2, '0')}${String(day).padStart(2, '0')}`;
};

/**
 * 自最近之台北日曆日起往回尋找，取得第一個 `STOCK_DAY_ALL` 有成交資料之交易日
 * @param ref 參考時間（預設現在）
 * @param maxLookbackDays 最多往回找幾天
 * @returns 該日 `Date`（UTC 午夜不代表交易時刻，僅供鍵入 TWSE 日期參數）
 */
export const findRecentTradingDateWithDayAll = async (
  ref: Date = new Date(),
  maxLookbackDays = 21,
): Promise<Date> => {
  const cur = new Date(ref);
  for (let i = 0; i < maxLookbackDays; i++) {
    const dateStr = formatDateTwse(cur);
    const url = `${TWSE_DAY_ALL}?date=${dateStr}&response=json`;
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) {
      cur.setDate(cur.getDate() - 1);
      continue;
    }
    const raw = (await res.json()) as TwseDayAllResponse;
    if (raw.stat === 'OK' && raw.data && raw.data.length > 0) {
      return cur;
    }
    cur.setDate(cur.getDate() - 1);
  }
  throw new Error(
    `TWSE STOCK_DAY_ALL：${maxLookbackDays} 日內無有效成交資料，請稍後再試或改用 SEED_TWSE_LIST_PATH`,
  );
};

/**
 * 下載並解析 OpenAPI 上市公司代號 → 簡稱
 * @returns Map（公司代號 → 公司簡稱）
 */
const fetchCompanyShortNames = async (): Promise<Map<string, string>> => {
  const res = await fetch(OPENAPI_COMPANIES, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`TWSE OpenAPI t187ap03_L HTTP ${res.status}`);
  const rows = (await res.json()) as TwseCompanyRow[];
  const m = new Map<string, string>();
  for (const r of rows) {
    const code = String(r.公司代號 ?? '').trim();
    if (code) m.set(code, String(r.公司簡稱 ?? '').trim());
  }
  return m;
};

/**
 * 下載並解析 OpenAPI 公司代號 → 產業別（中文）
 * @returns Map（公司代號 → 產業別）
 */
const fetchIndustryByCode = async (): Promise<Map<string, string>> => {
  const res = await fetch(OPENAPI_INDUSTRIES, {
    headers: { 'User-Agent': UA },
  });
  if (!res.ok) throw new Error(`TWSE OpenAPI t187ap05_L HTTP ${res.status}`);
  const rows = (await res.json()) as TwseIndustryRow[];
  const m = new Map<string, string>();
  for (const r of rows) {
    const code = String(r.公司代號 ?? '').trim();
    const ind = String(r.產業別 ?? '').trim();
    if (code && ind) m.set(code, ind);
  }
  return m;
};

/**
 * 取得單一台北日曆日之 STOCK_DAY_ALL 列資料
 * @param onDate 參考時間（取其台北日曆日）
 * @returns TWSE 回傳之 `data` 列
 */
const fetchStockDayAllRows = async (onDate: Date): Promise<string[][]> => {
  const dateStr = formatDateTwse(onDate);
  const url = `${TWSE_DAY_ALL}?date=${dateStr}&response=json`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`TWSE STOCK_DAY_ALL HTTP ${res.status}`);
  const raw = (await res.json()) as TwseDayAllResponse;
  if (raw.stat !== 'OK' || !raw.data?.length) {
    throw new Error(`TWSE STOCK_DAY_ALL 無資料：${dateStr}`);
  }
  return raw.data;
};

/**
 * 非上市公司列（權證代號常含英文字母）一律視為非 ETF
 * @param code 證券代號
 * @returns 是否為權證／組合商品等（僅依代號型式粗分）
 */
const isLikelyWarrantLike = (code: string): boolean => /[A-Za-z]/.test(code);

/**
 * 合併全日行情與 OpenAPI 公司／產業資料，產出 seed 用列
 * @param rows `STOCK_DAY_ALL` 之 `data`
 * @param shortByCode 公司簡稱
 * @param industryByCode 產業別
 * @returns 不重複之 `TwseSeedStockRow`（以代號為鍵）
 */
export const mergeTwseDayAllWithMetadata = (
  rows: string[][],
  shortByCode: Map<string, string>,
  industryByCode: Map<string, string>,
): TwseSeedStockRow[] => {
  const byCode = new Map<string, TwseSeedStockRow>();

  for (const row of rows) {
    if (!Array.isArray(row) || row.length < 9) continue;
    const code = String(row[0] ?? '').trim();
    const dayName = String(row[1] ?? '').trim();
    if (!code || !dayName) continue;

    const shortName = shortByCode.get(code);
    const displayName = shortName && shortName.length > 0 ? shortName : dayName;
    const isCompany = shortByCode.has(code);

    let sector: string;
    let isEtf: boolean;

    if (isCompany) {
      sector = industryByCode.get(code) ?? '未分類';
      isEtf = false;
    } else if (isLikelyWarrantLike(code)) {
      sector = '權證及其他';
      isEtf = false;
    } else {
      sector = 'ETF';
      isEtf = true;
    }

    byCode.set(code, {
      code,
      name: displayName,
      nameAlias: null,
      sector,
      isEtf,
      pe: null,
      marketCap: null,
    });
  }

  return [...byCode.values()].sort((a, b) =>
    a.code.localeCompare(b.code, 'en'),
  );
};

/**
 * 線上模式：抓取證交所全日行情與 OpenAPI，建立與當期上市成交標的一致之 `Stock` 種子列
 * @returns 種子列與所使用之行情日期（台北日曆 YYYYMMDD）
 */
export const fetchTwseSeedUniverseOnline = async (): Promise<{
  stocks: TwseSeedStockRow[];
  referenceDayYmd: string;
}> => {
  const tradingDay = await findRecentTradingDateWithDayAll();
  const referenceDayYmd = formatDateTwse(tradingDay);

  const rows = await fetchStockDayAllRows(tradingDay);
  await sleepTwseThrottle();
  const shortByCode = await fetchCompanyShortNames();
  await sleepTwseThrottle();
  const industryByCode = await fetchIndustryByCode();

  const stocks = mergeTwseDayAllWithMetadata(rows, shortByCode, industryByCode);

  return { stocks, referenceDayYmd };
};

/** 快照檔 JSON 之允許形狀 */
type SnapshotFile = {
  stocks: TwseSeedStockRow[];
};

/**
 * 自本機 JSON 快照載入種子列（供 CI／無網路）
 * @param absolutePath 檔案絕對路徑
 * @returns 種子列
 */
export const loadTwseSeedUniverseFromFile = async (
  absolutePath: string,
): Promise<TwseSeedStockRow[]> => {
  const raw = await readFile(absolutePath, 'utf8');
  const parsed = JSON.parse(raw) as SnapshotFile | TwseSeedStockRow[];
  const stocks = Array.isArray(parsed) ? parsed : parsed.stocks;
  if (!Array.isArray(stocks) || stocks.length === 0) {
    throw new Error('快照檔必須為非空陣列，或 { "stocks": [...] }');
  }
  for (const s of stocks) {
    if (!s.code || !s.name || typeof s.isEtf !== 'boolean' || !s.sector) {
      throw new Error(`快照列缺少欄位：${JSON.stringify(s)}`);
    }
  }
  return stocks;
};

/**
 * 依環境變數決定線上抓取或讀取快照，回傳種子列與摘要資訊
 * @returns stocks、來源說明、行情參考日（線上時）
 */
export const resolveTwseSeedStocks = async (): Promise<{
  stocks: TwseSeedStockRow[];
  source: string;
  referenceDayYmd: string | null;
}> => {
  const snap = process.env.SEED_TWSE_LIST_PATH?.trim();
  if (snap) {
    const stocks = await loadTwseSeedUniverseFromFile(snap);
    return {
      stocks,
      source: `snapshot:${snap}`,
      referenceDayYmd: null,
    };
  }

  const { stocks, referenceDayYmd } = await fetchTwseSeedUniverseOnline();
  return {
    stocks,
    source: 'online:STOCK_DAY_ALL+t187ap03_L+t187ap05_L',
    referenceDayYmd,
  };
};
