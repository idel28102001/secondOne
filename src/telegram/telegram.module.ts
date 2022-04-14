import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { TelegramUpdate } from './update/telegram.update';
import { TelegramService } from './services/telegram.service';

@Module({
  imports: [UsersModule],
  providers: [TelegramUpdate, TelegramService]
})
export class TelegramModule {}
