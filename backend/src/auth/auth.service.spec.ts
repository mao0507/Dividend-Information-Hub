import * as bcrypt from 'bcrypt'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  } as any

  const jwt = {
    sign: jest.fn().mockReturnValue('signed-token'),
  } as any

  const config = {
    get: jest.fn((k: string) => {
      if (k === 'JWT_EXPIRES_IN') return '15m'
      if (k === 'JWT_REFRESH_EXPIRES_IN') return '7d'
      if (k === 'JWT_SECRET') return 'secret'
      if (k === 'JWT_REFRESH_SECRET') return 'refresh-secret'
      return undefined
    }),
  } as any

  const service = new AuthService(prisma, jwt, config)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('register creates user and default settings', async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      email: 'new@example.com',
      name: 'Neo',
    })
    ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed')

    const result = await service.register({
      email: 'new@example.com',
      password: 'password123',
      name: 'Neo',
    })

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'new@example.com',
          settings: { create: {} },
        }),
      }),
    )
    expect(result).toEqual({ id: 'u1', email: 'new@example.com', name: 'Neo' })
  })

  it('register throws when email exists', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'exists' })

    await expect(
      service.register({
        email: 'dup@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException)
  })

  it('login throws when user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null)

    await expect(
      service.login({
        email: 'none@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('login returns user when password matches', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'u2',
      email: 'ok@example.com',
      name: 'OK',
      passwordHash: 'hash',
    })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

    const result = await service.login({
      email: 'ok@example.com',
      password: 'password123',
    })

    expect(result).toEqual({ id: 'u2', email: 'ok@example.com', name: 'OK' })
  })
})
