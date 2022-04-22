import { Injectable } from '@nestjs/common';
import { UsersEntity } from 'src/users/entities/users.entities';
import { Role } from 'src/users/enums/role.enum';
import { UsersService } from 'src/users/services/users.service';
import { Context } from 'telegraf';
import { Context as Ctx } from 'vm';
import { TelegramAdminService } from './telegram-admin.service';
import { TelegramService } from './telegram.service';

@Injectable()
export class TelegramMainService {
  constructor(
    private readonly usersService: UsersService,
    private readonly telegramAdminService: TelegramAdminService,
    private readonly telegramService: TelegramService,
  ) {}

  async sendKeyboard(ctx: Context, id: number) {
    const user = await this.usersService.getUserByTelegramId(id, ctx);
    if (!user) return;
    if (!user.telegramId) {
      user.telegramId = id;
      await this.usersService.save(user);
    }
    switch (user.role) {
      case Role.CLIENT: {
        await this.clientKeyboard(ctx);
        break;
      }
      case Role.OPERATOR: {
        await this.operatorKeyboard(ctx);
        break;
      }
      case Role.ADMIN: {
        await this.adminKeyboard(ctx);
        break;
      }
    }

  }


  async clientKeyboard(ctx: Context) {
    await ctx.reply('Меню клиента', { reply_markup: { inline_keyboard: [[{ text: 'Узнать курс', callback_data: 'client-(currency)' }, { text: 'Обмен', callback_data: 'client-(exchange)' }]] } });
  }

  async operatorKeyboard(ctx: Context) {
    await ctx.reply('Меню оператора', { reply_markup: { inline_keyboard: [[{ text: 'Настройки', callback_data: 'common-(settings)' }]] } });
  }

  async adminKeyboard(ctx: Context) {
    const wantsBeOPs = await this.usersService.getAllWantsBeOps();
    await ctx.reply('Меню администратора', {
      reply_markup: {
        inline_keyboard: [[{ text: 'Все операторы', callback_data: 'admin-(all)' }, { text: 'Удалить оператора', callback_data: 'admin-(remove)' }], [{
          text: `Заявки в операторы (${wantsBeOPs.length})`, callback_data: 'admin-(requests)'
        }]],
      }
    });
  }

  async beOperator(ctx: any, id: number) {
    const user = await this.usersService.getUserByTelegramId(id, ctx);
    if (!user) return;
    switch (user.role) {
      case Role.CLIENT: {
        await this.operatorClient(ctx, user);
        break;
      }
      case Role.OPERATOR: {
        await ctx.reply('Вы уже оператор');
        break;
      }
      case Role.ADMIN: {
        await ctx.reply('Зачем снижаться по рангу?');
        break;
      }
    }
  }

  async operatorClient(ctx: any, user: UsersEntity) {
    if (user.operatorReqPending) return await ctx.reply('Уже есть активная заявка');
    await this.notifyAllAdmins(ctx);
    user.operatorReqPending = true;
    await this.usersService.save(user);
    return await ctx.reply('Ваша заявка в обработке.');
  }

  async notifyAllAdmins(ctx: any) {
    const ops = await this.usersService.getAllAdmins();
    await Promise.all(ops.map(async (e) => {
      await ctx.telegram.sendMessage(e.telegramId, 'Новая заявка в операторы')
    }))
  }

  async allOpReq(ctx: any) {
    const wantsBeOps = await this.usersService.getAllWantsBeOps();
    const buttons = wantsBeOps.map(e => {
      const currName = `${e.firstName} ${e.lastName} - ${e.username}`;
      return [{ text: currName, callback_data: `adminReq-(decide)-(${e.id})` }];
    });
    ctx.reply('Все операторы', { reply_markup: { inline_keyboard: buttons } })
  }

  async adminReply(ctx: any) {
    const res = (ctx as unknown as Ctx).match[1];
    await this.telegramService.removeMessage(ctx);
    switch (res) {
      case 'requests': {
        await this.telegramAdminService.allOpReq(ctx);
        break;
      }
      case 'all': {
        await this.telegramAdminService.showAllOps(ctx);
        break;
      }
      case 'remove': {
        await this.telegramAdminService.showAllOpsWithRemovableBtn(ctx);
        break;
      }
      default: {
        await ctx.reply(`${res} - Информация будет по обновлении`);
      }
    }
  }

}
