import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter'
import { EmailService } from '@services/email.service';

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                transport: {
                    host: configService.get<string>('SMTP_HOST'),
                    port: configService.get<number>('SMTP_PORT'),
                    auth: {
                        user: configService.get<string>('SMTP_USER'),
                        pass: configService.get<string>('SMTP_PASS'),
                    },
                },
                defaults: {
                    from: configService.get<string>('SMTP_FROM')
                },
                template: {
                    dir: join(__dirname, '..', '..', 'src', 'emails'),
                    adapter: new EjsAdapter()
                }
            }),
            inject: [ConfigService]
        })
    ],
    providers: [EmailService],
    exports: [EmailService]
})
export class EmailModule { }
