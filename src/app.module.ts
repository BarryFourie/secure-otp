import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from '@modules/email.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@modules/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'public', 'client-app') }),
    AuthModule
  ],
  providers: [AppService],
})
export class AppModule { }
