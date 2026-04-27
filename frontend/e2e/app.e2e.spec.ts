import { test, expect, type Page } from '@playwright/test'

type NotificationItem = {
  id: string
  type: string
  stockCode?: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
}

type WatchlistItem = {
  id: string
  groupId: string
  stockCode: string
  order: number
  stock: {
    code: string
    name: string
    sector: string
    dividends?: Array<{ cash: number; exDate?: string }>
    prices?: Array<{ date: string; close: number }>
  }
}

const mockUser = { id: 'u1', email: 'test@example.com', name: 'Tester' }
const mockSearch = [
  { code: '2330', name: '台積電', sector: '半導體', market: 'TWSE', isEtf: false },
]

const setupApiMocks = async (page: Page) => {
  let isAuthed = true
  let notifications: NotificationItem[] = [
    {
      id: 'n1',
      type: 'exDiv',
      stockCode: '2330',
      title: '台積電即將除息',
      body: '三日後除息',
      isRead: false,
      createdAt: '2026-04-26T09:00:00.000Z',
    },
  ]
  const rules = [
    { id: 'r1', label: '除息提醒', type: 'exDiv', isOn: true, matchType: 'watchlist', channels: ['inApp'] },
  ]
  const group = { id: 'g1', name: '我的清單', color: '#22c55e', order: 0 }
  const watchlistItems: WatchlistItem[] = []

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
      if (!isAuthed) {
        await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'unauthorized' }) })
        return
      }
      await ok(mockUser)
      return
    }

    if ((path === '/auth/login' || path === '/auth/register') && method === 'POST') {
      isAuthed = true
      await ok({ user: mockUser })
      return
    }

    if (path === '/auth/refresh' && method === 'POST') {
      await ok({ ok: true })
      return
    }

    if (path === '/dashboard/summary' && method === 'GET') {
      await ok({
        todayExDiv: { count: 1, codes: ['2330'] },
        weekExDiv: { count: 2, watchlistCount: 1 },
        pendingFill: { count: 1, maxDays: 9 },
        nextPayout: { date: '2026-05-01', estimatedAmount: 1800 },
        accumulatedIncome: 48260,
        yoyPct: 12.4,
      })
      return
    }

    if (path === '/calendar/upcoming' && method === 'GET') {
      await ok([
        {
          stockCode: '2330',
          stockName: '台積電',
          amount: 3.5,
          freq: 'quarterly',
          type: 'exDiv',
          isWatchlist: true,
          date: '2026-05-01',
        },
      ])
      return
    }

    if (path === '/stocks/featured' && method === 'GET') {
      await ok({
        featured: {
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
          yieldPct: 4.2,
        },
      })
      return
    }

    if (path.startsWith('/stocks/') && path.endsWith('/price') && method === 'GET') {
      await ok([
        { date: '2026-04-24', close: 940, volume: 1000 },
        { date: '2026-04-25', close: 945, volume: 1200 },
        { date: '2026-04-26', close: 950, volume: 1300 },
      ])
      return
    }

    if (path === '/stocks' && method === 'GET') {
      await ok(mockSearch)
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

    if (path.startsWith('/stocks/') && method === 'GET') {
      const parts = path.split('/')
      const code = parts[2]
      if (parts.length === 3) {
        await ok({
          code,
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
          latestDividend: { year: 2026, period: 1, freq: 'quarterly', cash: 8.5 },
        })
        return
      }
      if (path.endsWith('/dividends')) {
        await ok([{ year: 2026, period: 1, cash: 8.5, freq: 'quarterly', filled: true }])
        return
      }
      if (path.endsWith('/peers')) {
        await ok([{ code: '2454', name: '聯發科', sector: '半導體', price: 1200, yieldPct: 2.8, cash: 34, marketCap: 1, isHighlight: false }])
        return
      }
      if (path.endsWith('/fill-progress')) {
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
    }

    if (path === '/watchlist' && method === 'GET') {
      const groupData = { ...group, items: watchlistItems }
      await ok([groupData])
      return
    }

    if (path === '/watchlist/summary' && method === 'GET') {
      await ok({
        totalStocks: watchlistItems.length,
        totalValue: watchlistItems.length * 950,
        yearIncome: watchlistItems.length * 3500,
        pendingExDiv: watchlistItems.length,
      })
      return
    }

    if (path === '/watchlist/groups' && method === 'POST') {
      await ok(group)
      return
    }

    if (path === '/watchlist/items' && method === 'POST') {
      const body = request.postDataJSON() as { groupId: string; stockCode: string }
      const stock = mockSearch.find((s) => s.code === body.stockCode) ?? mockSearch[0]
      const item: WatchlistItem = {
        id: `w-${watchlistItems.length + 1}`,
        groupId: body.groupId,
        stockCode: body.stockCode,
        order: watchlistItems.length,
        stock: {
          code: stock.code,
          name: stock.name,
          sector: stock.sector,
          dividends: [{ cash: 8.5, exDate: '2026-05-01' }],
          prices: [
            { date: '2026-04-26', close: 950 },
            { date: '2026-04-25', close: 942 },
          ],
        },
      }
      watchlistItems.push(item)
      await ok(item)
      return
    }

    if (path === '/alerts/notifications' && method === 'GET') {
      await ok({
        data: notifications,
        page: 1,
        limit: 20,
        total: notifications.length,
        unread: notifications.filter((n) => !n.isRead).length,
        totalPages: 1,
      })
      return
    }

    if (path === '/alerts/notifications/read-all' && method === 'PATCH') {
      notifications = notifications.map((n) => ({ ...n, isRead: true }))
      await ok({ ok: true, count: notifications.length })
      return
    }

    if (/^\/alerts\/notifications\/.+\/read$/.test(path) && method === 'PATCH') {
      const id = path.split('/')[3]
      notifications = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      await ok({ ok: true })
      return
    }

    if (path === '/alerts/rules' && method === 'GET') {
      await ok(rules)
      return
    }

    if (path === '/alerts/rules' && method === 'POST') {
      await ok({ id: 'r-new', label: '新規則', type: 'exDiv', isOn: true, matchType: 'watchlist', channels: ['inApp'] })
      return
    }

    if (/^\/alerts\/rules\/.+$/.test(path) && method === 'PATCH') {
      await ok({ ok: true })
      return
    }

    if (/^\/alerts\/rules\/.+$/.test(path) && method === 'DELETE') {
      await ok({ ok: true })
      return
    }

    await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: `unmocked: ${method} ${path}` }) })
  })
}

test.beforeEach(async ({ page }) => {
  await setupApiMocks(page)
  await page.goto('/dashboard')
  await expect(page.getByText('股息站')).toBeVisible()
})

test('登入後導向 Dashboard', async ({ page }) => {
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByText('主選單')).toBeVisible({ timeout: 10_000 })
})

test('加入自選股後在 Watchlist 顯示', async ({ page }) => {
  await page.goto('/watchlist')
  await page.getByRole('button', { name: '新增至自選' }).click()
  await page.getByPlaceholder('輸入代號或名稱').fill('2330')
  await page.getByRole('button', { name: /2330.*台積電/ }).click()
  await expect(page.getByText('台積電')).toBeVisible()
})

test('Command Palette 搜尋後導向個股詳情', async ({ page }) => {
  await page.getByRole('button', { name: '搜尋股票' }).click()
  await page.getByPlaceholder('搜尋股票代號或名稱...').fill('2330')
  await page.locator('div.fixed.inset-0.z-\\[100\\]').getByText('台積電').first().click()

  await expect(page).toHaveURL(/\/stock\/2330/)
  await expect(page.getByRole('heading', { name: '台積電' })).toBeVisible()
})
