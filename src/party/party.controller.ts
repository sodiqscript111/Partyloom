import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { PartyService } from './party.service';

@Controller('party')
export class PartyController {
  constructor(private readonly partySVC: PartyService) {}

  @Get()
  getAllParty() {
    return this.partySVC.getParties();
  }

  @Get(':id')
  getParty(@Param('id') id: string) {
    return this.partySVC.getPartyById(id);
  }

  @Post()
  createParty(
    @Body()
    data: {
      name: string;
      description?: string;
      date: Date;
      totalAmount: number;
      divideEqually?: boolean;
    },
  ) {
    return this.partySVC.create(data);
  }

  @Post(':partyId/register')
  registerUser(
    @Param('partyId') partyId: string,
    @Body('userId') userId: string,
  ) {
    return this.partySVC.registerUserForParty(partyId, userId);
  }
}
