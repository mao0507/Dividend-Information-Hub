import router from './index'

describe('router not-found behavior', () => {
  it('resolves unknown path to not-found route', () => {
    const resolved = router.resolve('/unknown-path-for-404')
    expect(resolved.name).toBe('not-found')
  })

  it('keeps existing known routes intact', () => {
    const dashboard = router.resolve('/dashboard')
    const watchlist = router.resolve('/watchlist')

    expect(dashboard.name).toBe('dashboard')
    expect(watchlist.name).toBe('watchlist')
  })
})
