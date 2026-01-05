import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserFilterDto, PartyFilterDto, ToggleUserStatusDto, ToggleAdminDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getUsers(filters: UserFilterDto) {
        const { page = 1, limit = 10, search, isActive, isAdmin } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        if (isAdmin !== undefined) {
            where.isAdmin = isAdmin;
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    isAdmin: true,
                    isActive: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data: users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getAllParties(filters: PartyFilterDto) {
        const { page = 1, limit = 10, search } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [parties, total] = await Promise.all([
            this.prisma.party.findMany({
                where,
                skip,
                take: limit,
                include: {
                    participants: {
                        select: {
                            id: true,
                            userId: true,
                            isAdmin: true,
                        },
                    },
                    _count: {
                        select: {
                            participants: true,
                            contributions: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.party.count({ where }),
        ]);

        return {
            data: parties,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async toggleUserStatus(userId: string, dto: ToggleUserStatusDto) {
        return await this.prisma.user.update({
            where: { id: userId },
            data: { isActive: dto.isActive },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                isAdmin: true,
            },
        });
    }

    async toggleAdminRole(userId: string, dto: ToggleAdminDto) {
        return await this.prisma.user.update({
            where: { id: userId },
            data: { isAdmin: dto.isAdmin },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                isAdmin: true,
            },
        });
    }

    async deleteParty(partyId: string) {
        return await this.prisma.party.delete({
            where: { id: partyId },
        });
    }

    async getSystemStats() {
        const [totalUsers, activeUsers, adminUsers, totalParties, activeParties] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { isActive: true } }),
            this.prisma.user.count({ where: { isAdmin: true } }),
            this.prisma.party.count(),
            this.prisma.party.count({
                where: {
                    date: {
                        gte: new Date(),
                    },
                },
            }),
        ]);

        return {
            users: {
                total: totalUsers,
                active: activeUsers,
                admins: adminUsers,
                inactive: totalUsers - activeUsers,
            },
            parties: {
                total: totalParties,
                upcoming: activeParties,
                past: totalParties - activeParties,
            },
        };
    }
}
