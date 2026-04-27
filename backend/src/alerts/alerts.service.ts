import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

type RuleInput = {
  label: string
  type: string
  matchType?: string
  stockCode?: string | null
  channels?: string[]
  threshold?: number | null
  isOn?: boolean
}

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 取得通知列表（支援 type 與分頁）
   * @param userId 使用者 id
   * @param type 通知類型
   * @param page 頁碼（1-based）
   * @returns 分頁通知資料
   */
  async getNotifications(userId: string, type?: string, page = 1) {
    const safePage = Math.max(1, page)
    const pageSize = 20
    const where = {
      userId,
      ...(type ? { type } : {}),
    }

    const [items, total, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ])

    return {
      data: items,
      page: safePage,
      limit: pageSize,
      total,
      unread,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    }
  }

  /**
   * 全部通知標示已讀
   * @param userId 使用者 id
   * @returns 影響筆數
   */
  async readAllNotifications(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
    return { ok: true, count: result.count }
  }

  /**
   * 單筆通知標示已讀
   * @param userId 使用者 id
   * @param id 通知 id
   * @returns 更新結果
   */
  async readNotification(userId: string, id: string) {
    const row = await this.prisma.notification.findFirst({
      where: { id, userId },
      select: { id: true },
    })
    if (!row) throw new NotFoundException('通知不存在')
    await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })
    return { ok: true }
  }

  /**
   * 取得提醒規則
   * @param userId 使用者 id
   * @returns 規則列表
   */
  async getRules(userId: string) {
    return this.prisma.alertRule.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    })
  }

  /**
   * 新增提醒規則
   * @param userId 使用者 id
   * @param dto 請求內容
   * @returns 新增結果
   */
  async createRule(userId: string, dto: RuleInput) {
    return this.prisma.alertRule.create({
      data: {
        userId,
        label: dto.label,
        type: dto.type,
        matchType: dto.matchType ?? 'watchlist',
        stockCode: dto.stockCode ?? null,
        channels: dto.channels ?? ['inApp'],
        threshold: dto.threshold ?? null,
        isOn: dto.isOn ?? true,
      },
    })
  }

  /**
   * 修改提醒規則（含 toggle isOn）
   * @param userId 使用者 id
   * @param id 規則 id
   * @param dto 請求內容
   * @returns 更新結果
   */
  async updateRule(userId: string, id: string, dto: Partial<RuleInput>) {
    const row = await this.prisma.alertRule.findFirst({
      where: { id, userId },
      select: { id: true },
    })
    if (!row) throw new NotFoundException('規則不存在')
    return this.prisma.alertRule.update({
      where: { id },
      data: {
        ...(dto.label !== undefined ? { label: dto.label } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.matchType !== undefined ? { matchType: dto.matchType } : {}),
        ...(dto.stockCode !== undefined ? { stockCode: dto.stockCode } : {}),
        ...(dto.channels !== undefined ? { channels: dto.channels } : {}),
        ...(dto.threshold !== undefined ? { threshold: dto.threshold } : {}),
        ...(dto.isOn !== undefined ? { isOn: dto.isOn } : {}),
      },
    })
  }

  /**
   * 刪除提醒規則
   * @param userId 使用者 id
   * @param id 規則 id
   * @returns 刪除結果
   */
  async deleteRule(userId: string, id: string) {
    const row = await this.prisma.alertRule.findFirst({
      where: { id, userId },
      select: { id: true },
    })
    if (!row) throw new NotFoundException('規則不存在')
    await this.prisma.alertRule.delete({ where: { id } })
    return { ok: true }
  }
}
