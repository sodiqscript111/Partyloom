import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PartyAdminGuard } from './guards/party-admin.guard';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        UserModule,
        PrismaModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'default-secret',
                signOptions: {
                    expiresIn: '24h',
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        JwtAuthGuard,
        PartyAdminGuard,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
    exports: [AuthService, JwtAuthGuard, PartyAdminGuard],
})
export class AuthModule { }
