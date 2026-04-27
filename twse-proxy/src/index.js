export default {
	/**
	 * TWSE MI_INDEX 最小 proxy
	 * @param {Request} request
	 * @returns {Promise<Response>}
	 */
	async fetch(request) {
		const url = new URL(request.url);

		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: corsHeaders(),
			});
		}

		if (url.pathname !== '/twse/mi-index') {
			return json({ error: 'not found' }, 404);
		}

		if (request.method !== 'GET') {
			return json({ error: 'method not allowed' }, 405);
		}

		const date = url.searchParams.get('date') ?? '';
		const type = url.searchParams.get('type') ?? 'ALLBUT0999';
		const response = url.searchParams.get('response') ?? 'json';

		if (!/^\d{8}$/.test(date)) {
			return json({ error: 'date is required (YYYYMMDD)' }, 400);
		}

		const upstream = new URL('https://www.twse.com.tw/rwd/zh/afterTrading/MI_INDEX');
		upstream.searchParams.set('date', date);
		upstream.searchParams.set('type', type);
		upstream.searchParams.set('response', response);

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
					'Cache-Control': 'no-store',
					...corsHeaders(),
				},
			});
		} catch (error) {
			return json({ error: `upstream fetch failed: ${error instanceof Error ? error.message : String(error)}` }, 502);
		}
	},
};

const corsHeaders = () => ({
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET,OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
});

const json = (data, status = 200) =>
	new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			...corsHeaders(),
		},
	});
