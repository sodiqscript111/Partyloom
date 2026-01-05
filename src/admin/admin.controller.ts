import { Controller, Get, Post, Delete, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UserFilterDto, PartyFilterDto, ToggleUserStatusDto, ToggleAdminDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from './guards/admin-role.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Get('stats')
    async getStats() {
        return this.adminService.getSystemStats();
    }

    @Get('users')
    async getUsers(@Query() filters: UserFilterDto) {
        return this.adminService.getUsers(filters);
    }

    @Patch('users/:id/status')
    async toggleUserStatus(
        @Param('id') userId: string,
        @Body() dto: ToggleUserStatusDto,
    ) {
        return this.adminService.toggleUserStatus(userId, dto);
    }

    @Patch('users/:id/admin')
    async toggleAdminRole(
        @Param('id') userId: string,
        @Body() dto: ToggleAdminDto,
    ) {
        return this.adminService.toggleAdminRole(userId, dto);
    }

    @Get('parties')
    async getAllParties(@Query() filters: PartyFilterDto) {
        return this.adminService.getAllParties(filters);
    }

    @Delete('parties/:id')
    async deleteParty(@Param('id') partyId: string) {
        return this.adminService.deleteParty(partyId);
    }
}
