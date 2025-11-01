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

  @Post(':partyId/unregister')
  unregisterUser(
    @Param('partyId') partyId: string,
    @Body('userId') userId: string,
  ) {
    return this.partySVC.unregisterUserFromParty(partyId, userId);
  }

  @Post(':partyId/contribute')
  contributeToParty(
    @Param('partyId') partyId: string,
    @Body('userId') userId: string,
    @Body('amount') amount: number,
  ) {
    return this.partySVC.contributeToParty(partyId, userId, amount);
  }

  @Get(':partyId/contributions')
  getPartyContributions(@Param('partyId') partyId: string) {
    return this.partySVC.getPartyContributions(partyId);
  }
}
