import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ServiceResponse } from '../interfaces/service-response.interface';
import { OTP } from '@entities/otp.entity';
import { OtpService } from './otp.service';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
    constructor(
        private otpService: OtpService,
        private userService: UserService,
        private configService: ConfigService,
        private emailService: EmailService
    ) { }

    /**
     * 
     * @param email The email address of the user
     * @param password The password to be validated
     * @returns A service respomse consumed by a controller
     * @description This method validates an OTP for a particular user with the given email address
     */
    async validateOtp(email: string, password: string): Promise<ServiceResponse<OTP>> {
        const user = await this.userService.findOne({ email });
        if (!user) {
            throw new HttpException('You have not requested an OTP with the provided email address', HttpStatus.NOT_FOUND);
        }

        const lastOtp = (await user.otps).sort((a, b) => b.fromDate.getTime() - a.fromDate.getTime())[0];
        if (lastOtp.password !== password) {
            throw new HttpException('The OTP that you have provided is not valid', HttpStatus.UNAUTHORIZED);
        }
        if (lastOtp.used) {
            throw new HttpException('The OTP you provided has already been used', HttpStatus.UNAUTHORIZED);
        }
        const otpExpiry = Number(this.configService.get<number>('OTP_EXPIRY'));

        if (otpExpiry && lastOtp.fromDate < new Date(new Date().getTime() - otpExpiry * 1000)) {
            throw new HttpException('The OTP you provided has expired', HttpStatus.GONE)
        }

        await this.otpService.update(lastOtp.id, { used: true });
        return {
            message: 'The provided OTP is valid',
            entity: lastOtp,
            result: true
        }
    }

    /**
     * 
     * @param email The email address of the user
     * @returns The service response consumed by the controller
     * @description This method generates a new OTP for the user with the given email adddress.
     * If the request is within a certain period of a previous request, if so send the same OTP. 
     * It checks how many times a OTP has been resent an prevents it from sending any more than the max limit.
     */
    async resendOtp(email: string): Promise<ServiceResponse<OTP>> {
        const user = await this.userService.findOne({ email })
        if (!user) {
            throw new HttpException('You have not requested an OTP yet', HttpStatus.NOT_FOUND)
        }

        // Checks if the user has requested an OTP within the OTP's lifetime, and if so, resend the same OTP and update the OTP's fromDate
        const otpLifetime = Number(this.configService.get<number>('OTP_LIFETIME'));
        const otpResendLimit = Number(this.configService.get<number>('OTP_RESEND_LIMIT'));
        const recentOtps = (await user.otps)
            .filter((otp) => (otpLifetime && otp.created > new Date(new Date().getTime() - 60 * otpLifetime * 1000)))
            .sort((a, b) => b.created.getTime() - a.created.getTime());

        if (recentOtps.length) {
            if(recentOtps[0].used){
                throw new HttpException('The OTP you provided has already been used', HttpStatus.UNAUTHORIZED)
            }
            // Limit how many times an OTP can be resent
            if (otpResendLimit && recentOtps[0].resendCount >= otpResendLimit) {
                throw new HttpException('You have requested that this OTP be resent to many times', HttpStatus.TOO_MANY_REQUESTS);
            }
           
            // Update an OTP resendCount and send it again
            await this.otpService.update(recentOtps[0].id, { fromDate: new Date(), resendCount: recentOtps[0].resendCount + 1 });
            return await this.emailOtp(email, recentOtps[0], 'You should receive an OTP shortly');
        }

        //If there are no recent OTPs then a new one should be created and sent
        return await this.sendOTP(email);
    }

    /**
     * 
     * @param email The email address of the user
     * @returns A service response
     * @description This method generates a new OTP for the user with a particular email address and creates a new user if that user does not exist
     * It also checks if the user has exceeded the maximum number of OTP requests per hour.
     */
    async sendOTP(email: string): Promise<ServiceResponse<OTP>> {
        // Check if a user exists, and if not create a new user
        let user = await this.userService.findOne({ email });
        if (!user) {
            user = await this.userService.create(email);
        }

        //Check if a user has exceeded the max number of OTP requests per hour
        const maxOtps = Number(this.configService.get<number>('MAX_OTP_PER_HOUR'));
        const recentOtp = (await user.otps).filter((otp) => otp.created > new Date(new Date().getTime() - 60 * 60 * 1000));
        if (maxOtps && recentOtp.length >= maxOtps) {
            throw new HttpException('You have exceeded the maximum number of OTP requests per hour', HttpStatus.TOO_MANY_REQUESTS);
        }

        return this.createAndSendOtp(email, 'You should receive an OTP shortly');
    }

    /**
     * 
     * @param email The email address of the user
     * @param message The response message
     * @returns The service response consumed by the controller
     * @description This method generates a new OTP for the user with the given email addresss
     */
    private async createAndSendOtp(email: string, message: string): Promise<ServiceResponse<OTP>> {
        const otp = await this.otpService.create(email);
        return await this.emailOtp(email, otp, message)
    }

    /**
     * 
     * @param email The email address of the user
     * @param otp The OTP entity
     * @param message The response message
     * @returns The service response consumed by the controller
     * @description This method sends a OTP to a particular email addresss
     */
    private async emailOtp(email: string, otp: OTP, message: string): Promise<ServiceResponse<OTP>> {
        await this.emailService.otpEmail(email, otp.password);
        return {
            message,
            entity: otp
        }
    }
}
