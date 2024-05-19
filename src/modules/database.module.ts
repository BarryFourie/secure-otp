import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports:[ConfigService],
            useFactory: async (configService:ConfigService)=>({
                type: 'postgres',
                host: configService.get<string>('POSTGRES_HOST'),
                port: configService.get<number>('POSTGRES_PORT'),
                username: configService.get<string>('POSTGRES_USERNAME'),
                password: configService.get<string>('POSTGRES_DATABASE'),
                entities: [join(__dirname, '..', '..', 'src', 'entities', '*'  )],
                //Since this app wont go into production
                synchronize:true
            }),
        })
    ]
})
export class DatabaseModule {}
