import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
} from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src";

const run = async (url, init) => {
	const request = new Request(url, init);
	const ctx = createExecutionContext();
	const response = await worker.fetch(request, env, ctx);
	await waitOnExecutionContext(ctx);
	return response;
};

describe("twse-proxy", () => {
	it("回傳 404 給未知路徑", async () => {
		const response = await run("http://example.com/unknown");
		expect(response.status).toBe(404);
	});

	it("缺少 date 參數時回傳 400", async () => {
		const response = await run("http://example.com/twse/mi-index");
		expect(response.status).toBe(400);
	});

	it("date 格式錯誤時回傳 400", async () => {
		const response = await run("http://example.com/twse/mi-index?date=2024-01-01");
		expect(response.status).toBe(400);
	});

	it("type 不在白名單時回傳 400", async () => {
		const response = await run("http://example.com/twse/mi-index?date=20240101&type=ANYTHING");
		expect(response.status).toBe(400);
		const body = await response.json();
		expect(body.error).toMatch(/type must be one of/);
	});

	it("白名單內的 Origin 應回傳 Access-Control-Allow-Origin（用無效 type 避免真的打上游）", async () => {
		const response = await run("http://example.com/twse/mi-index?date=20240101&type=INVALID", {
			headers: { Origin: "http://localhost:5174" },
		});
		expect(response.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:5174");
	});

	it("非白名單 Origin 不應回傳 Access-Control-Allow-Origin", async () => {
		const response = await run("http://example.com/twse/mi-index?date=20240101&type=INVALID", {
			headers: { Origin: "http://evil.example.com" },
		});
		expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
	});

	it("非 GET method 回傳 405", async () => {
		const response = await run("http://example.com/twse/mi-index?date=20240101", {
			method: "POST",
		});
		expect(response.status).toBe(405);
	});

	it("OPTIONS 應回傳 204", async () => {
		const response = await run("http://example.com/twse/mi-index", { method: "OPTIONS" });
		expect(response.status).toBe(204);
	});
});
