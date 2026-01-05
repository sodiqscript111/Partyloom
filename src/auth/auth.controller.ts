import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @SkipThrottle()
    async getProfile(@Request() req) {
        return this.authService.getProfile(req.user.id);
    }
}
