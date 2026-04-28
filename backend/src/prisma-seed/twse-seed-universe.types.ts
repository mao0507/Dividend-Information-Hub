/**
 * Seed 用「上市證券」一筆（對應 Prisma `Stock` 可 upsert 之欄位子集）
 */
export type TwseSeedStockRow = {
  code: string;
  name: string;
  nameAlias: null;
  sector: string;
  isEtf: boolean;
  pe: null;
  marketCap: null;
};
