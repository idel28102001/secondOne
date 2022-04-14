import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { config } from './common/config';
import { TelegramModule } from './telegram/telegram.module';
import { TestWizard } from './telegram/wizards/first.wizard';
import { UsersModule } from './users/users.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), TypeOrmModule.forRootAsync({ useFactory: () => config.getDatabaseOptions() }), TelegramModule,
  TelegrafModule.forRoot({
    token: config.telegramToken(),
    middlewares: [session()]
  }), UsersModule],
  providers: [TestWizard]
})
export class AppModule {}
