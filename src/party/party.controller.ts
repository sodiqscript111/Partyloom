import { Body, Controller, Post, Get, Param, Delete, Put } from '@nestjs/common';
import { PartyService } from './party.service';
import { CreatePartyDto, UpdatePartyDto, CreatePartyItemDto, ContributeDto, RegisterUserDto } from './dto/party.dto';

@Controller('party')
export class PartyController {
  constructor(private readonly partySVC: PartyService) { }

  @Get()
  getAllParty() {
    return this.partySVC.getParties();
  }

  @Get(':id')
  getParty(@Param('id') id: string) {
    return this.partySVC.getPartyById(id);
  }

  @Post()
  createParty(@Body() createPartyDto: CreatePartyDto) {
    return this.partySVC.create({
      ...createPartyDto,
      date: new Date(createPartyDto.date),
    });
  }

  @Post(':partyId/register')
  registerUser(@Param('partyId') partyId: string, @Body() registerUserDto: RegisterUserDto) {
    return this.partySVC.registerUserForParty(partyId, registerUserDto.userId);
  }

  @Post(':partyId/unregister')
  unregisterUser(@Param('partyId') partyId: string, @Body() registerUserDto: RegisterUserDto) {
    return this.partySVC.unregisterUserFromParty(partyId, registerUserDto.userId);
  }

  @Post(':partyId/contribute')
  contributeToParty(@Param('partyId') partyId: string, @Body() contributeDto: ContributeDto) {
    return this.partySVC.contributeToParty(partyId, contributeDto.userId, contributeDto.amount);
  }

  @Get(':partyId/contributions')
  getPartyContributions(@Param('partyId') partyId: string) {
    return this.partySVC.getPartyContributions(partyId);
  }

  @Get(':partyId/summary')
  getSummary(@Param('partyId') partyId: string) {
    return this.partySVC.getPartyContributionSummary(partyId);
  }

  @Post(':partyId/invite')
  generateInvite(@Param('partyId') partyId: string) {
    return this.partySVC.generateInviteLink(partyId);
  }

  @Post('join/:code')
  joinParty(@Param('code') code: string, @Body() registerUserDto: RegisterUserDto) {
    return this.partySVC.joinPartyByInvite(registerUserDto.userId, code);
  }

  @Post(':partyId/partyitem')
  createPartyItem(@Param('partyId') partyId: string, @Body() createPartyItemDto: CreatePartyItemDto) {
    return this.partySVC.createPartyItem(partyId, createPartyItemDto.name, createPartyItemDto.assignedToId);
  }

  @Delete(':partyId/partyitem/:itemId')
  deletePartyItem(@Param('partyId') partyId: string, @Param('itemId') itemId: string) {
    return this.partySVC.deletePartyItem(partyId, itemId);
  }

  @Delete(':partyId')
  deleteParty(@Param('partyId') partyId: string) {
    return this.partySVC.deleteParty(partyId);
  }

  @Put(':partyId')
  updateParty(@Param('partyId') partyId: string, @Body() updatePartyDto: UpdatePartyDto) {
    return this.partySVC.updateParty(partyId, {
      ...updatePartyDto,
      date: updatePartyDto.date ? new Date(updatePartyDto.date) : undefined,
    });
  }

  @Get(':partyId/partyitem')
  getPartyItems(@Param('partyId') partyId: string) {
    return this.partySVC.getPartyItems(partyId);
  }

  @Get(':partyId/partyuser')
  getPartyUsers(@Param('partyId') partyId: string) {
    return this.partySVC.getPartyUsers(partyId);
  }
}
