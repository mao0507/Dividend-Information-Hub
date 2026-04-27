import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

type BrokerLink = {
  id: string
  broker: string
  account?: string
  linkedAt: string
}

type SyncPref = {
  autoSync: boolean
  positions: boolean
  dividends: boolean
  profile: boolean
  notifications: boolean
}

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * MVP：券商連結記錄暫存（未建 migration 前先以記憶體保存）。
   */
  private readonly brokerLinks = new Map<string, BrokerLink[]>()

  /**
   * MVP：同步偏好暫存（未建 migration 前先以記憶體保存）。
   */
  private readonly syncPrefs = new Map<string, SyncPref>()

  /**
   * 取得使用者設定
   * @param userId 使用者 id
   * @returns 設定資料
   */
  async getSettings(userId: string) {
    const row = await this.prisma.userSettings.findUnique({
      where: { userId },
    })
    if (!row) {
      return this.prisma.userSettings.create({
        data: { userId },
      })
    }
    return row
  }

  /**
   * 更新使用者設定（外觀相關）
   * @param userId 使用者 id
   * @param payload 更新資料
   * @returns 更新後設定
   */
  async updateSettings(
    userId: string,
    payload: Partial<{
      accent: string
      upRed: boolean
      density: string
      monoFont: string
      sansFont: string
      radius: number
    }>,
  ) {
    await this.getSettings(userId)
    return this.prisma.userSettings.update({
      where: { userId },
      data: {
        ...(payload.accent !== undefined ? { accent: payload.accent } : {}),
        ...(payload.upRed !== undefined ? { upRed: payload.upRed } : {}),
        ...(payload.density !== undefined ? { density: payload.density } : {}),
        ...(payload.monoFont !== undefined ? { monoFont: payload.monoFont } : {}),
        ...(payload.sansFont !== undefined ? { sansFont: payload.sansFont } : {}),
        ...(payload.radius !== undefined ? { radius: payload.radius } : {}),
      },
    })
  }

  /**
   * 取得券商連結清單
   * @param userId 使用者 id
   * @returns 券商連結列表
   */
  getBrokerLinks(userId: string) {
    return this.brokerLinks.get(userId) ?? []
  }

  /**
   * 新增券商連結記錄
   * @param userId 使用者 id
   * @param broker 券商名稱
   * @param account 帳號提示（選填）
   * @returns 新增資料
   */
  linkBroker(userId: string, broker: string, account?: string) {
    const list = this.brokerLinks.get(userId) ?? []
    const entry: BrokerLink = {
      id: `brk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      broker,
      account,
      linkedAt: new Date().toISOString(),
    }
    this.brokerLinks.set(userId, [entry, ...list])
    return entry
  }

  /**
   * 刪除券商連結
   * @param userId 使用者 id
   * @param id 連結 id
   * @returns 刪除結果
   */
  deleteBrokerLink(userId: string, id: string) {
    const list = this.brokerLinks.get(userId) ?? []
    const next = list.filter((item) => item.id !== id)
    if (next.length === list.length) {
      throw new NotFoundException('broker link not found')
    }
    this.brokerLinks.set(userId, next)
    return { ok: true }
  }

  /**
   * 更新同步偏好
   * @param userId 使用者 id
   * @param patch 局部同步偏好
   * @returns 更新後偏好
   */
  updateSyncPref(userId: string, patch: Partial<SyncPref>) {
    const current: SyncPref = this.syncPrefs.get(userId) ?? {
      autoSync: true,
      positions: true,
      dividends: true,
      profile: false,
      notifications: true,
    }
    const next: SyncPref = {
      ...current,
      ...patch,
    }
    this.syncPrefs.set(userId, next)
    return next
  }
}
