import { BadRequestException, NotFoundException } from '@nestjs/common'
import { WatchlistService } from './watchlist.service'

describe('WatchlistService', () => {
  const prisma = {
    watchlistGroup: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findFirstOrThrow: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    watchlistItem: {
      count: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
    holding: {
      findMany: jest.fn(),
    },
    stockPrice: {
      findMany: jest.fn(),
    },
    dividend: {
      findMany: jest.fn(),
    },
  } as any

  const service = new WatchlistService(prisma)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('createGroup sets order by current group count', async () => {
    prisma.watchlistGroup.count.mockResolvedValue(2)
    prisma.watchlistGroup.create.mockResolvedValue({ id: 'g3' })

    const result = await service.createGroup('u1', '新群組', '#22c55e')

    expect(prisma.watchlistGroup.create).toHaveBeenCalledWith({
      data: { userId: 'u1', name: '新群組', color: '#22c55e', order: 2 },
    })
    expect(result).toEqual({ id: 'g3' })
  })

  it('deleteGroup throws when group still has items', async () => {
    prisma.watchlistGroup.findFirst.mockResolvedValue({
      id: 'g1',
      _count: { items: 1 },
    })

    await expect(service.deleteGroup('g1', 'u1')).rejects.toBeInstanceOf(BadRequestException)
  })

  it('deleteGroup throws not found when no group', async () => {
    prisma.watchlistGroup.findFirst.mockResolvedValue(null)

    await expect(service.deleteGroup('x', 'u1')).rejects.toBeInstanceOf(NotFoundException)
  })

  it('reorder updates every id with matching order', async () => {
    prisma.watchlistItem.updateMany.mockResolvedValue({ count: 1 })

    const res = await service.reorder(['a', 'b', 'c'], 'u1')

    expect(prisma.watchlistItem.updateMany).toHaveBeenCalledTimes(3)
    expect(prisma.watchlistItem.updateMany).toHaveBeenNthCalledWith(1, {
      where: { id: 'a', group: { userId: 'u1' } },
      data: { order: 0 },
    })
    expect(prisma.watchlistItem.updateMany).toHaveBeenNthCalledWith(3, {
      where: { id: 'c', group: { userId: 'u1' } },
      data: { order: 2 },
    })
    expect(res).toEqual({ ok: true })
  })
})
