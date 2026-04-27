import { NotFoundException } from '@nestjs/common'
import { AlertsService } from './alerts.service'

describe('AlertsService', () => {
  const prisma = {
    notification: {
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    alertRule: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as any

  const service = new AlertsService(prisma)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getNotifications applies pagination and type filter', async () => {
    prisma.notification.findMany.mockResolvedValue([{ id: 'n1', type: 'exDiv' }])
    prisma.notification.count
      .mockResolvedValueOnce(21)
      .mockResolvedValueOnce(3)

    const result = await service.getNotifications('u1', 'exDiv', 2)

    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'u1', type: 'exDiv' },
        skip: 20,
        take: 20,
      }),
    )
    expect(result.totalPages).toBe(2)
    expect(result.unread).toBe(3)
  })

  it('createRule fills default values', async () => {
    prisma.alertRule.create.mockResolvedValue({ id: 'r1' })

    await service.createRule('u1', {
      label: '除息提醒',
      type: 'exDiv',
    })

    expect(prisma.alertRule.create).toHaveBeenCalledWith({
      data: {
        userId: 'u1',
        label: '除息提醒',
        type: 'exDiv',
        matchType: 'watchlist',
        stockCode: null,
        channels: ['inApp'],
        threshold: null,
        isOn: true,
      },
    })
  })

  it('updateRule throws when missing rule', async () => {
    prisma.alertRule.findFirst.mockResolvedValue(null)

    await expect(service.updateRule('u1', 'none', { isOn: false })).rejects.toBeInstanceOf(NotFoundException)
  })

  it('deleteRule throws when missing rule', async () => {
    prisma.alertRule.findFirst.mockResolvedValue(null)

    await expect(service.deleteRule('u1', 'none')).rejects.toBeInstanceOf(NotFoundException)
  })
})
