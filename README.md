# Dividend Information Hub

股息站（Dividend Information Hub）是前後端分離專案：
- `frontend`: Vue 3 + TypeScript + Vite
- `backend`: NestJS + Prisma + PostgreSQL

## 本機開發

### 1) 啟動後端

```bash
cd backend
npm install
# 請先建立或編輯 .env，至少要設定 DATABASE_URL / JWT_SECRET / JWT_REFRESH_SECRET
# DATABASE_URL 推薦用 Supabase 免費方案的 PostgreSQL（見「部署建議」章節）
npx prisma migrate dev
npm run db:seed
npm run start:dev
```

**`db:seed` 說明**：會向 TWSE 與證交所 OpenAPI 抓取**當期上市（全日行情所列）證券**，寫入 `Stock`（約千餘筆，視交易日資料而定）；首次執行需網路。無網路／CI 可預先準備快照 JSON，並在 `.env` 設定 `SEED_TWSE_LIST_PATH`（見 `backend/docs/TWSE_DATA_SOURCES.md`）。

預設後端：http://localhost:3000

### 2) 啟動前端

```bash
cd frontend
npm install
npm run dev
```

預設前端：http://localhost:5174

## 測試

### 前端單元測試（Vitest）

```bash
cd frontend
npm run test:unit
```

### 前端 E2E（Playwright）

```bash
cd frontend
npx playwright install chromium
npm run test:e2e
```

### 後端單元測試（Jest）

```bash
cd backend
npm run test
```

## 部署建議

- 前端可部署到 Vercel，`frontend/vercel.json` 已提供 SPA fallback 與 `/api` rewrite 範本（請先替換成你的後端正式網域）。
- 後端可使用 `backend/Dockerfile` 建置容器部署（Render / Railway / Fly.io / Koyeb 皆可）。
- 資料庫推薦用 [Supabase](https://supabase.com) 免費方案（PostgreSQL，5GB / 500MB 依方案而定）：
  1. 建立專案後於 Project Settings → Database → Connection string 取得連線字串
  2. 後端是長跑 Node server（非 serverless/edge function），直接用 **direct connection**（port `5432`）即可，不需要 pgbouncer connection pooler
  3. 設定 `.env` 的 `DATABASE_URL` 後執行 `npx prisma migrate deploy` 套用既有 migrations
