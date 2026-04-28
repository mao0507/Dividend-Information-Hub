import http from 'node:http';

const PORT = Number.parseInt(process.env.TWSE_PROXY_PORT ?? '8787', 10);
const HOST = process.env.TWSE_PROXY_HOST ?? '127.0.0.1';
const TARGET_BASE = 'https://www.twse.com.tw/rwd/zh/afterTrading/MI_INDEX';

/**
 * 寫入 JSON 回應
 * @param {http.ServerResponse} res HTTP 回應
 * @param {number} statusCode 狀態碼
 * @param {unknown} body JSON 內容
 * @returns {void}
 */
const writeJson = (res, statusCode, body) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
};

/**
 * 由請求 URL 產生 TWSE 目標 URL
 * @param {URL} reqUrl 請求 URL
 * @returns {URL} 轉發目標
 */
const buildTargetUrl = (reqUrl) => {
  const targetUrl = new URL(TARGET_BASE);
  const date = reqUrl.searchParams.get('date') ?? '';
  const type = reqUrl.searchParams.get('type') ?? 'ALLBUT0999';
  const response = reqUrl.searchParams.get('response') ?? 'json';
  targetUrl.searchParams.set('date', date);
  targetUrl.searchParams.set('type', type);
  targetUrl.searchParams.set('response', response);
  return targetUrl;
};

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    writeJson(res, 400, { error: 'invalid request' });
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://${HOST}:${PORT}`);
  if (reqUrl.pathname !== '/twse/mi-index') {
    writeJson(res, 404, { error: 'not found' });
    return;
  }

  if (req.method !== 'GET') {
    writeJson(res, 405, { error: 'method not allowed' });
    return;
  }

  const date = reqUrl.searchParams.get('date');
  if (!date || !/^\d{8}$/.test(date)) {
    writeJson(res, 400, { error: 'date is required (YYYYMMDD)' });
    return;
  }

  try {
    const targetUrl = buildTargetUrl(reqUrl);
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; DividendHubProxy/1.0; +https://github.com/)',
      },
    });

    const text = await upstream.text();
    res.writeHead(upstream.status, {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    });
    res.end(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeJson(res, 502, { error: `upstream fetch failed: ${message}` });
  }
});

server.listen(PORT, HOST, () => {
  console.log(
    `[twse-proxy] running at http://${HOST}:${PORT}/twse/mi-index?date=20260303&type=ALLBUT0999&response=json`,
  );
});
