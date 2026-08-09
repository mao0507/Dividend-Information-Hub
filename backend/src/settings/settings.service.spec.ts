import { Test } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { SettingsService } from './settings.service'
import { PrismaService } from '../prisma/prisma.service'

describe('SettingsService', () => {
  let svc: SettingsService
  let prisma: {
    userSettings: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock }
  }

  beforeEach(async () => {
    prisma = {
      userSettings: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    }

    const mod = await Test.createTestingModule({
      providers: [SettingsService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    svc = mod.get(SettingsService)
  })

  afterEach(() => jest.clearAllMocks())

  describe('getSettings()', () => {
    it('已存在設定時直接回傳', async () => {
      prisma.userSettings.findUnique.mockResolvedValue({ userId: 'user-1', accent: 'blue' })

      const result = await svc.getSettings('user-1')

      expect(result).toEqual({ userId: 'user-1', accent: 'blue' })
      expect(prisma.userSettings.create).not.toHaveBeenCalled()
    })

    it('查無資料時自動建立預設設定', async () => {
      prisma.userSettings.findUnique.mockResolvedValue(null)
      prisma.userSettings.create.mockResolvedValue({ userId: 'user-1' })

      const result = await svc.getSettings('user-1')

      expect(prisma.userSettings.create).toHaveBeenCalledWith({ data: { userId: 'user-1' } })
      expect(result).toEqual({ userId: 'user-1' })
    })
  })

  describe('updateSettings()', () => {
    it('僅更新有傳入的欄位', async () => {
      prisma.userSettings.findUnique.mockResolvedValue({ userId: 'user-1' })
      prisma.userSettings.update.mockResolvedValue({ userId: 'user-1', accent: 'red' })

      const result = await svc.updateSettings('user-1', { accent: 'red' })

      expect(prisma.userSettings.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { accent: 'red' },
      })
      expect(result).toEqual({ userId: 'user-1', accent: 'red' })
    })

    it('未提供任何欄位時 data 為空物件', async () => {
      prisma.userSettings.findUnique.mockResolvedValue({ userId: 'user-1' })
      prisma.userSettings.update.mockResolvedValue({ userId: 'user-1' })

      await svc.updateSettings('user-1', {})

      expect(prisma.userSettings.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {},
      })
    })
  })

  describe('券商連結（記憶體暫存）', () => {
    it('新使用者取得券商連結應回傳空陣列', () => {
      expect(svc.getBrokerLinks('user-2')).toEqual([])
    })

    it('新增後應可取得，且刪除後應消失', () => {
      const entry = svc.linkBroker('user-2', '國泰證券', 'acc-123')

      expect(svc.getBrokerLinks('user-2')).toHaveLength(1)
      expect(entry.broker).toBe('國泰證券')

      const deleteResult = svc.deleteBrokerLink('user-2', entry.id)

      expect(deleteResult).toEqual({ ok: true })
      expect(svc.getBrokerLinks('user-2')).toEqual([])
    })

    it('刪除不存在的連結應拋出 NotFoundException', () => {
      expect(() => svc.deleteBrokerLink('user-2', 'not-exist')).toThrow(NotFoundException)
    })
  })

  describe('updateSyncPref()', () => {
    it('首次呼叫應以預設值為基礎合併局部更新', () => {
      const result = svc.updateSyncPref('user-3', { autoSync: false })

      expect(result).toEqual({
        autoSync: false,
        positions: true,
        dividends: true,
        profile: false,
        notifications: true,
      })
    })

    it('第二次呼叫應以上次結果為基礎繼續合併', () => {
      svc.updateSyncPref('user-3', { autoSync: false })
      const result = svc.updateSyncPref('user-3', { dividends: false })

      expect(result).toEqual({
        autoSync: false,
        positions: true,
        dividends: false,
        profile: false,
        notifications: true,
      })
    })
  })
})
