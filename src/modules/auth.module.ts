import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { EmailModule } from './email.module';
import { AuthController } from '@controllers/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OTP } from '@entities/otp.entity';
import { User } from '@entities/user.entity';
import { AuthService } from '@services/auth.service';
import { OtpService } from '@services/otp.service';
import { UserService } from '@services/user.service';

@Module({
    controllers: [AuthController],
    imports: [DatabaseModule, EmailModule, TypeOrmModule.forFeature([User, OTP])],
    providers: [AuthService, OtpService, UserService]
})
export class AuthModule { }
