import { test, expect, type Page } from '@playwright/test'

const setupApiMocks = async (page: Page) => {
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (!url.pathname.startsWith('/api/')) {
      await route.continue()
      return
    }
    const path = url.pathname.replace('/api', '')
    const method = request.method()

    const ok = (data: unknown) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) })

    if (path === '/auth/me' && method === 'GET') {
      await ok({ id: 'u1', email: 'demo@example.com' })
      return
    }

    if (path === '/stocks/ranking' && method === 'GET') {
      await ok({
        data: [
          {
            rank: 1,
            code: '2330',
            name: '台積電',
            sector: '半導體',
            freq: 'quarterly',
            yield: 4.2,
            cash: 35,
            price: 950,
            changePct: 0.85,
            fillRate: 100,
            badge: '長配',
            isEtf: false,
          },
        ],
        total: 1,
      })
      return
    }

    if (path === '/stocks/ranking/presets' && method === 'GET') {
      await ok([])
      return
    }

    if (path === '/stocks/2330' && method === 'GET') {
      await ok({
        code: '2330',
        name: '台積電',
        market: 'TWSE',
        sector: '半導體',
        isEtf: false,
        price: 950,
        change: 8,
        changePct: 0.85,
        volume: 100000,
        updatedAt: '2026-04-26T09:00:00.000Z',
        streak: 10,
        annualCash: 35,
        yieldPct: 3.68,
      })
      return
    }

    if (path === '/stocks/2330/dividends' && method === 'GET') {
      await ok([{ year: 2026, period: 1, cash: 8.5, freq: 'quarterly', filled: true }])
      return
    }

    if (path === '/stocks/2330/price' && method === 'GET') {
      await ok([
        { date: '2026-04-24', close: 940, volume: 1000 },
        { date: '2026-04-25', close: 945, volume: 1200 },
        { date: '2026-04-26', close: 950, volume: 1300 },
      ])
      return
    }

    if (path === '/stocks/2330/peers' && method === 'GET') {
      await ok([])
      return
    }

    if (path === '/stocks/2330/fill-progress' && method === 'GET') {
      await ok({
        exDate: '2026-04-01',
        divAmount: 3.5,
        exPrice: 930,
        targetPrice: 930,
        currentPrice: 950,
        progressPct: 100,
        daysSinceEx: 25,
        filled: true,
        fillDays: 16,
      })
      return
    }

    await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: `unmocked: ${method} ${path}` }) })
  })
}

test.beforeEach(async ({ page }) => {
  await setupApiMocks(page)
})

test('ranking to stock detail and back should not black screen', async ({ page }) => {
  await page.goto('/ranking')
  await expect(page.getByRole('banner').getByText('高股息排行')).toBeVisible()
  await expect(page.getByRole('cell', { name: '2330' })).toBeVisible()

  await page.getByRole('cell', { name: '2330' }).click()
  await expect(page).toHaveURL(/\/stock\/2330/)
  await expect(page.getByRole('heading', { name: '台積電' })).toBeVisible()

  await page.goBack()
  await expect(page).toHaveURL(/\/ranking/)
  await expect(page.getByText('篩選')).toBeVisible()
  await expect(page.getByRole('cell', { name: '2330' })).toBeVisible()
})
