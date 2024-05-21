import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
    constructor(private mailerService: MailerService) {
    }

    async otpEmail(to: string, password: string) {
        await this.mailerService.sendMail({
            to,
            subject: 'Here is your awesome One-Time Password',
            template: 'otp.email.ejs',
            text: `Here is your awsome OTP:${password}. Verify it here: https://barry-8080.entrostat.dev/validate-otp/'`,
            
            context: {
                password
            }
        })
    }
}
