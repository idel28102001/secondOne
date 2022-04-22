import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { config } from './common/config';
import { TelegramModule } from './telegram/telegram.module';
import { BuyWizard } from './telegram/wizards/buy.wizard';
import { UsersModule } from './users/users.module';
import { RequestsModule } from './requests/requests.module';
import { AddWalletWizard } from './telegram/wizards/add-wallet.wizard';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), TypeOrmModule.forRootAsync({ useFactory: () => config.getDatabaseOptions() }), TelegramModule,
  TelegrafModule.forRoot({
    token: config.telegramToken(),
    middlewares: [session()]
  }), UsersModule, RequestsModule],
  providers: [BuyWizard, AddWalletWizard]
})
export class AppModule {}
