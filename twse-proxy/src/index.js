const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5174'];
const ALLOWED_TYPES = ['ALLBUT0999', 'ALL', 'MS'];

/**
 * 解析 env.ALLOWED_ORIGINS（逗號分隔）取得允許的來源清單
 * @param {{ALLOWED_ORIGINS?: string}} env
 * @returns {string[]}
 */
const resolveAllowedOrigins = (env) => {
	const raw = env?.ALLOWED_ORIGINS;
	if (!raw) return DEFAULT_ALLOWED_ORIGINS;
	return raw.split(',').map((o) => o.trim()).filter(Boolean);
};

export default {
	/**
	 * TWSE MI_INDEX 最小 proxy
	 * @param {Request} request
	 * @param {{ALLOWED_ORIGINS?: string}} env
	 * @returns {Promise<Response>}
	 */
	async fetch(request, env) {
		const url = new URL(request.url);
		const allowedOrigins = resolveAllowedOrigins(env);
		const origin = request.headers.get('Origin');
		const headers = corsHeaders(origin, allowedOrigins);

		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers });
		}

		if (url.pathname !== '/twse/mi-index') {
			return json({ error: 'not found' }, 404, headers);
		}

		if (request.method !== 'GET') {
			return json({ error: 'method not allowed' }, 405, headers);
		}

		const date = url.searchParams.get('date') ?? '';
		const type = url.searchParams.get('type') ?? 'ALLBUT0999';

		if (!/^\d{8}$/.test(date)) {
			return json({ error: 'date is required (YYYYMMDD)' }, 400, headers);
		}

		if (!ALLOWED_TYPES.includes(type)) {
			return json({ error: `type must be one of: ${ALLOWED_TYPES.join(', ')}` }, 400, headers);
		}

		const upstream = new URL('https://www.twse.com.tw/rwd/zh/afterTrading/MI_INDEX');
		upstream.searchParams.set('date', date);
		upstream.searchParams.set('type', type);
		upstream.searchParams.set('response', 'json');

		try {
			const res = await fetch(upstream.toString(), {
				headers: {
					'User-Agent': 'Mozilla/5.0 (compatible; DividendHubProxy/1.0)',
					Accept: 'application/json,text/plain,*/*',
					Referer: 'https://www.twse.com.tw/',
				},
			});

			const body = await res.text();
			return new Response(body, {
				status: res.status,
				headers: {
					'Content-Type': res.headers.get('content-type') ?? 'application/json; charset=utf-8',
					'Cache-Control': 's-maxage=3600',
					...headers,
				},
			});
		} catch (error) {
			return json({ error: `upstream fetch failed: ${error instanceof Error ? error.message : String(error)}` }, 502, headers);
		}
	},
};

/**
 * 依請求 Origin 是否在白名單內決定 CORS 標頭；不在名單內則不回傳 Allow-Origin
 * @param {string | null} origin
 * @param {string[]} allowedOrigins
 * @returns {Record<string, string>}
 */
const corsHeaders = (origin, allowedOrigins) => {
	const headers = {
		'Access-Control-Allow-Methods': 'GET,OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
		Vary: 'Origin',
	};
	if (origin && allowedOrigins.includes(origin)) {
		headers['Access-Control-Allow-Origin'] = origin;
	}
	return headers;
};

const json = (data, status = 200, headers = {}) =>
	new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			...headers,
		},
	});
