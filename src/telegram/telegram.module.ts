import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { TelegramUpdate } from './update/telegram.update';
import { TelegramService } from './services/telegram.service';
import { TelegramAdminService } from './services/telegram-admin.service';
import { TelegramMainService } from './services/telegram-main.service';
import { TelegramClientService } from './services/telegram-client.service';
import { RequestsModule } from 'src/requests/requests.module';
import { TelegramOperatorService } from './services/telegram-operator.service';
import { TelegramCommonService } from './services/telegram-common.service';

@Module({
  imports: [UsersModule, RequestsModule],
  providers: [TelegramUpdate, TelegramService, TelegramAdminService, TelegramMainService, TelegramClientService, TelegramOperatorService, TelegramCommonService],
})
export class TelegramModule {}
