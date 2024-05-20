import { OTP } from '@entities/otp.entity';
import { ServiceResponse } from '@interfaces/service-response.interface';
import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '@services/auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('sendOtp')
    async sendOtp(@Body('email') email: string) {
        try {
            const response = await this.authService.sendOTP(email);
            return { message: response.message };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Post('resendOtp')
    async resendOtp(@Body('email') email: string) {
        try {
            const response = await this.authService.resendOtp(email);
            return { message: response.message };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Post('validateOtp')
    async validateOtp(@Body('email') email: string, @Body('password') password: string) {
        try {
            const validity: ServiceResponse<OTP> = await this.authService.validateOtp(email, password);
            return { message: validity.message, result: validity.result };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }
}
