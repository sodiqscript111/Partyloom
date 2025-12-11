import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class PartyService {
  constructor(private prisma: PrismaService) { }

  getParties() {
    return this.prisma.party.findMany();
  }

  create(
    data: {
      name: string;
      description?: string;
      date: Date;
      totalAmount: number;
      divideEqually?: boolean;
    },
    creatorId?: string,
  ) {
    return this.prisma.party.create({
      data: {
        ...data,
        participants: creatorId
          ? {
            create: {
              userId: creatorId,
              amount: 0,
              isAdmin: true,
            },
          }
          : undefined,
      },
      include: { participants: true },
    });
  }
  getPartyById(id: string) {
    return this.prisma.party.findUnique({
      where: { id: String(id) },
    });
  }

  async registerUserForParty(partyId: string, userId: string) {
    const party = await this.prisma.party.findUnique({
      where: { id: partyId },
    });
    if (!party) throw new Error('Party not found');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new Error('User not found');

    const existing = await this.prisma.partyParticipant.findFirst({
      where: { partyId, userId },
    });
    if (existing) throw new Error('User already registered for this party');

    let amount = 0;
    if (party.divideEqually) {
      const totalParticipants = await this.prisma.partyParticipant.count({
        where: { partyId },
      });
      amount = party.totalAmount / (totalParticipants + 1); // +1 for new user
    }

    return this.prisma.partyParticipant.create({
      data: {
        userId,
        partyId,
        amount,
      },
    });
  }

  async unregisterUserFromParty(partyId: string, userId: string) {
    const party = await this.prisma.party.findUnique({
      where: { id: partyId },
    });
    if (!party) throw new Error('Party not found');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new Error('User not found');

    const existing = await this.prisma.partyParticipant.findFirst({
      where: { partyId, userId },
    });
    if (!existing) throw new Error('User not registered for this party');

    return this.prisma.partyParticipant.delete({
      where: { id: existing.id },
    });
  }

  async contributeToParty(partyId: string, userId: string, amount: number) {
    const party = await this.prisma.party.findUnique({
      where: { id: partyId },
      include: { participants: true },
    });
    if (!party) throw new Error('Party not found');
    const isMember = party.participants.some((p) => p.userId === userId);

    if (!isMember) throw new Error('User is not a member of this party');

    const contribution = await this.prisma.contribution.create({
      data: {
        amount,
        userId,
        partyId,
      },
    });

    return { message: 'Contribution added successfully', contribution };
  }

  async getPartyContributions(partyId: string) {
    return this.prisma.contribution.findMany({
      where: { partyId },
      include: { user: true },
    });
  }
  async getPartyContributionSummary(partyId: string) {
    const party = await this.prisma.party.findUnique({
      where: { id: partyId },
      include: { contributions: true },
    });

    if (!party) throw new Error('Party not found');

    const totalContributed = party.contributions.reduce(
      (sum, c) => sum + c.amount,
      0,
    );
    const remaining = party.totalAmount - totalContributed;

    return {
      totalContributed,
      remaining,
      goal: party.totalAmount,
    };
  }

  async generateInviteLink(partyId: string) {
    const code = randomBytes(6).toString('hex');

    const party = await this.prisma.party.update({
      where: { id: partyId },
      data: { inviteCode: code },
    });

    return {
      inviteLink: `https://partyloom.app/invite/${code}`,
      party,
    };
  }

  async joinPartyByInvite(userId: string, code: string) {
    const party = await this.prisma.party.findUnique({
      where: { inviteCode: code },
    });

    if (!party) throw new Error('Invalid invite code');


    const exists = await this.prisma.partyParticipant.findFirst({
      where: { userId, partyId: party.id },
    });

    if (exists) return { message: 'Already a member' };

    const participant = await this.prisma.partyParticipant.create({
      data: { userId, partyId: party.id, amount: 0 },
    });

    return { message: 'Joined successfully!', participant };
  }

  async createPartyItem(partyId: string, name: string, assignedToId?: string) {
    return this.prisma.partyItem.create({
      data: { partyId, name, assignedToId },
    });
  }

  async deletePartyItem(partyId: string, itemId: string) {
    return this.prisma.partyItem.delete({
      where: { id: itemId },
    });
  }

  async deleteParty(partyId: string) {
    return this.prisma.party.delete({
      where: { id: partyId },
    });
  }

  async updateParty(partyId: string, data: { name?: string; description?: string; date?: Date; totalAmount?: number; divideEqually?: boolean }) {
    return this.prisma.party.update({
      where: { id: partyId },
      data,
    });
  }

  async getPartyItems(partyId: string) {
    return this.prisma.partyItem.findMany({
      where: { partyId },
    });
  }

  async getPartyUsers(partyId: string) {
    return this.prisma.partyParticipant.findMany({
      where: { partyId },
      include: { user: true },
    });
  }

  async removeParticipant(partyId: string, participantUserId: string) {
    const participant = await this.prisma.partyParticipant.findFirst({
      where: { partyId, userId: participantUserId },
    });

    if (!participant) {
      throw new Error('User is not a participant of this party');
    }

    return this.prisma.partyParticipant.delete({
      where: { id: participant.id },
    });
  }

  async promoteToAdmin(partyId: string, userId: string) {
    const participant = await this.prisma.partyParticipant.findFirst({
      where: { partyId, userId },
    });

    if (!participant) {
      throw new Error('User is not a participant of this party');
    }

    return this.prisma.partyParticipant.update({
      where: { id: participant.id },
      data: { isAdmin: true },
    });
  }

  async demoteFromAdmin(partyId: string, userId: string) {
    const participant = await this.prisma.partyParticipant.findFirst({
      where: { partyId, userId },
    });

    if (!participant) {
      throw new Error('User is not a participant of this party');
    }

    return this.prisma.partyParticipant.update({
      where: { id: participant.id },
      data: { isAdmin: false },
    });
  }

  async isUserAdmin(partyId: string, userId: string): Promise<boolean> {
    const participant = await this.prisma.partyParticipant.findFirst({
      where: { partyId, userId, isAdmin: true },
    });
    return !!participant;
  }
}
