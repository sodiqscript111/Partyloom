import { Body, Controller, Post, Get, Param, Delete, Put, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { PartyService } from './party.service';
import { CreatePartyDto, UpdatePartyDto, CreatePartyItemDto, ContributeDto, RegisterUserDto } from './dto/party.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PartyAdminGuard } from '../auth/guards/party-admin.guard';

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

  // Create party - optionally with authenticated user as admin
  @Post()
  createParty(@Body() createPartyDto: CreatePartyDto & { creatorId?: string }) {
    return this.partySVC.create(
      {
        ...createPartyDto,
        date: new Date(createPartyDto.date),
      },
      createPartyDto.creatorId,
    );
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

  // ============ ADMIN-ONLY ENDPOINTS ============

  // Admin: Remove a participant from party
  @UseGuards(JwtAuthGuard, PartyAdminGuard)
  @Delete(':partyId/participant/:userId')
  async removeParticipant(
    @Param('partyId') partyId: string,
    @Param('userId') userId: string,
  ) {
    try {
      return await this.partySVC.removeParticipant(partyId, userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Admin: Promote user to admin
  @UseGuards(JwtAuthGuard, PartyAdminGuard)
  @Post(':partyId/admin/:userId')
  async promoteToAdmin(
    @Param('partyId') partyId: string,
    @Param('userId') userId: string,
  ) {
    try {
      return await this.partySVC.promoteToAdmin(partyId, userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Admin: Demote user from admin
  @UseGuards(JwtAuthGuard, PartyAdminGuard)
  @Delete(':partyId/admin/:userId')
  async demoteFromAdmin(
    @Param('partyId') partyId: string,
    @Param('userId') userId: string,
  ) {
    try {
      return await this.partySVC.demoteFromAdmin(partyId, userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
