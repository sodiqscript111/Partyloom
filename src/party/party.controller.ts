import { Body, Controller, Post, Get } from '@nestjs/common';
import { PartyService } from './party.service';

@Controller('party')
export class PartyController {
  constructor(private readonly partySVC: PartyService) {}

  @Get()
  getAllParty() {
    return this.partySVC.getParties();
  }

@Get(':id')              // GET /party/:id
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
}
