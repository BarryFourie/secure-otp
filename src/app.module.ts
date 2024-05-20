import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from '@modules/email.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@modules/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
