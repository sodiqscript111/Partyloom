import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async createUser(data: { name: string; email: string }) {
    const hashedPassword = await bcrypt.hash('defaultPassword123', 10);
    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    this.redisService.set(data.email, hashedPassword);

    await this.cacheManager.del('users:all');
    return user;
  }

  async getUsers() {
    const cacheKey = 'users:all';
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isActive: true,
        createdAt: true,
      },
    });

    await this.cacheManager.set(cacheKey, users, 300000);
    return users;
  }

  async getUserById(id: string) {
    const cacheKey = `user:${id}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (user) {
      await this.cacheManager.set(cacheKey, user, 300000);
    }

    return user;
  }

  async deleteUser(id: string) {
    const result = await this.prisma.user.delete({ where: { id } });

    await this.cacheManager.del('users:all');
    await this.cacheManager.del(`user:${id}`);
    return result;
  }

  async updateUser(id: string, data: { name?: string; email?: string }) {
    const result = await this.prisma.user.update({ where: { id }, data });

    await this.cacheManager.del('users:all');
    await this.cacheManager.del(`user:${id}`);
    return result;
  }
}
