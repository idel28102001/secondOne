import { Injectable } from '@nestjs/common';
import { UsersEntity } from 'src/users/entities/users.entities';
import { Role } from 'src/users/enums/role.enum';
import { UsersService } from 'src/users/services/users.service';
import { Context, Scenes, Telegraf } from 'telegraf';
import { Context as Ctx } from 'vm';

@Injectable()
export class TelegramService {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  async sendKeyboard(ctx: Context, username: string, id: number) {
    const user = await this.usersService.getUserByUsername(username, ctx);
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

    //const s = new Telegraf('');
    //s.telegram.sendMessage

  }


  async clientKeyboard(ctx: Context) {
    await ctx.reply('Меню клиента', { reply_markup: { inline_keyboard: [[{ text: 'Посмотреть мультфильм', callback_data: 'watch-(cartoon)' }, { text: 'Посмотреть фильм', callback_data: 'watch-(movie)' }]] } });
  }

  async operatorKeyboard(ctx: Context) {
    await ctx.reply('Меню оператора', { reply_markup: { inline_keyboard: [[{ text: 'Получить смс', callback_data: 'op-(sms)' }], [{ text: 'Обновить информацию о слотах', callback_data: 'op-(slot)' }]] } });
  }

  async adminKeyboard(ctx: Context) {
    const wantsBeOPs = await this.usersService.getAllWantsBeOps();
    await ctx.reply('Меню администратора', {
      reply_markup: {
        inline_keyboard: [[{ text: 'Все операторы', callback_data: 'admin-(all)' }, { text: 'Удалить оператора', callback_data: 'admin-(remove)' }], [{
          text: `Заявки в операторы (${wantsBeOPs.length})`, callback_data: 'admin-(request)'
        }]],
      }
    });
  }

  async beOperator(ctx: any, id: number) {
    const user = await this.usersService.getUserBId(id, ctx);
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
      return [{ text: currName, callback_data: `adminReq-(${e.id})` }];
    });
    ctx.reply('Все операторы', { reply_markup: { inline_keyboard: buttons } })
  }

  async reqDecide(ctx: any) {
    const id = parseInt(ctx.match[2]);
    console.log(id);
  }

  async adminReply(ctx: any) {
    const res = (ctx as unknown as Ctx).match[1];
    switch (res) {
      case 'add': {
        await ctx.scene.enter('add-op');
        break;
      }
      case 'request': {
        await this.allOpReq(ctx);
        break;
      }
      case 'req-decide': {
        await this.reqDecide(ctx);
        break;
      }
      default: {
        await ctx.reply(`${res} - Информация будет по обновлении`);
      }
    }
  }
}
