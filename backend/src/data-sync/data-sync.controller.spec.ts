import { ConflictException } from '@nestjs/common'
import { DataSyncController } from './data-sync.controller'

const mockScheduler = {
  isRunning: false,
  runSync: jest.fn(),
} as any

describe('DataSyncController', () => {
  const controller = new DataSyncController(mockScheduler)

  beforeEach(() => {
    jest.clearAllMocks()
    mockScheduler.isRunning = false
  })

  it('returns sync result on successful trigger', async () => {
    mockScheduler.runSync.mockResolvedValue({ priceRows: 50, dividendRows: 10, durationMs: 1200 })

    const result = await controller.trigger()
    expect(result).toEqual({ priceRows: 50, dividendRows: 10, durationMs: 1200 })
    expect(mockScheduler.isRunning).toBe(false)
  })

  it('throws 409 Conflict when sync is already running', async () => {
    mockScheduler.isRunning = true
    await expect(controller.trigger()).rejects.toThrow(ConflictException)
    expect(mockScheduler.runSync).not.toHaveBeenCalled()
  })

  it('resets isRunning to false even if runSync throws', async () => {
    mockScheduler.runSync.mockRejectedValue(new Error('sync failed'))

    await expect(controller.trigger()).rejects.toThrow('sync failed')
    expect(mockScheduler.isRunning).toBe(false)
  })
})
