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
}
