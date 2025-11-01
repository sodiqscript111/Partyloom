import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PartyService {
  constructor(private prisma: PrismaService) {}

  getParties() {
    return this.prisma.party.findMany();
  }

  create(data: {
    name: string;
    description?: string;
    date: Date;
    totalAmount: number;
    divideEqually?: boolean;
  }) {
    return this.prisma.party.create({ data });
  }
  getPartyById(id: string) {
    return this.prisma.party.findUnique({
      where: { id: String(id) },
    });
  }

  async registerUserForParty(partyId: string, userId: string) {
    // 1️⃣ Check if the party exists
    const party = await this.prisma.party.findUnique({
      where: { id: partyId },
    });
    if (!party) throw new Error('Party not found');

    // 2️⃣ Check if the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new Error('User not found');

    // 3️⃣ Check if user already registered
    const existing = await this.prisma.partyParticipant.findFirst({
      where: { partyId, userId },
    });
    if (existing) throw new Error('User already registered for this party');

    // 4️⃣ Compute amount
    let amount = 0;
    if (party.divideEqually) {
      const totalParticipants = await this.prisma.partyParticipant.count({
        where: { partyId },
      });
      amount = party.totalAmount / (totalParticipants + 1); // +1 for new user
    }

    // 5️⃣ Create the participant record
    return this.prisma.partyParticipant.create({
      data: {
        userId,
        partyId,
        amount,
      },
    });
  }

  async unregisterUserFromParty(partyId: string, userId: string) {
    // 1️⃣ Check if the party exists
    const party = await this.prisma.party.findUnique({
      where: { id: partyId },
    });
    if (!party) throw new Error('Party not found');

    // 2️⃣ Check if the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new Error('User not found');

    // 3️⃣ Check if user is
    const existing = await this.prisma.partyParticipant.findFirst({
      where: { partyId, userId },
    });
    if (!existing) throw new Error('User not registered for this party');

    return this.prisma.partyParticipant.delete({
      where: { id: existing.id },
    });
  }
}
