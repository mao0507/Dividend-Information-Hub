import { readFile } from 'node:fs/promises';
import type { TwseSeedStockRow } from './twse-seed-universe.types';

/** TWSE OpenAPI 全日行情列（節錄；`Date` 為民國年 YYYMMDD） */
type TwseDayAllOpenApiRow = {
  Date: string;
  Code: string;
  Name: string;
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

/**
 * `rwd/zh/afterTrading/STOCK_DAY_ALL` 的 `response=json` 參數已失效（實測恆回傳 CSV），
 * 改用永遠回傳 JSON 的 OpenAPI 版本（不支援指定日期，恆回傳最近一個交易日）
 */
const TWSE_DAY_ALL_OPENAPI =
  'https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL';
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
 * 民國年 YYYMMDD 轉西元 YYYYMMDD
 * @param roc 民國年日期字串，例如 "1150807"
 * @returns 西元 YYYYMMDD，例如 "20260807"
 */
const rocToYmd = (roc: string): string => {
  const y = parseInt(roc.slice(0, roc.length - 4), 10) + 1911;
  const monthDay = roc.slice(roc.length - 4);
  return `${y}${monthDay}`;
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
 * 取得最近一個交易日之全日行情（OpenAPI 恆回傳 JSON，不支援指定日期）
 * @returns `mergeTwseDayAllWithMetadata` 相容之列資料，與行情參考日（西元 YYYYMMDD）
 */
const fetchStockDayAllRows = async (): Promise<{
  rows: string[][];
  referenceDayYmd: string;
}> => {
  const res = await fetch(TWSE_DAY_ALL_OPENAPI, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`TWSE OpenAPI STOCK_DAY_ALL HTTP ${res.status}`);
  const raw = (await res.json()) as TwseDayAllOpenApiRow[];
  if (!raw.length) throw new Error('TWSE OpenAPI STOCK_DAY_ALL 無資料');

  const referenceDayYmd = rocToYmd(raw[0].Date);
  const rows = raw.map((r) => [r.Code, r.Name, '', '', '', '', '', '', '']);
  return { rows, referenceDayYmd };
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
  const { rows, referenceDayYmd } = await fetchStockDayAllRows();
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
