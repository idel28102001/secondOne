import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { TelegramUpdate } from './update/telegram.update';
import { TelegramService } from './services/telegram.service';
import { TelegramAdminService } from './services/telegram-admin.service';
import { TelegramMainService } from './services/telegram-main.service';
import { TelegramClientService } from './services/telegram-client.service';

@Module({
  imports: [UsersModule],
  providers: [TelegramUpdate, TelegramService, TelegramAdminService, TelegramMainService, TelegramClientService],
  exports: []
})
export class TelegramModule {}
