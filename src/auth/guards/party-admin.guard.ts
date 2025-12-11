import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PartyAdminGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const partyId = request.params.partyId;

        if (!user || !partyId) {
            throw new ForbiddenException('Access denied');
        }

        // Check if user is an admin of this party
        const participant = await this.prisma.partyParticipant.findFirst({
            where: {
                userId: user.id,
                partyId: partyId,
                isAdmin: true,
            },
        });

        if (!participant) {
            throw new ForbiddenException('Only party admins can perform this action');
        }

        return true;
    }
}
