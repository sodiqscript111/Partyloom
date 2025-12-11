import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async createUser(data: { name: string; email: string }) {
    const hashedPassword = await bcrypt.hash('defaultPassword123', 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async getUsers() {
    return this.prisma.user.findMany();
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async updateUser(id: string, data: { name?: string; email?: string }) {
    return this.prisma.user.update({ where: { id }, data });
  }
}
