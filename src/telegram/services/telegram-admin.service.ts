import { Injectable } from '@nestjs/common';
import { UsersEntity } from 'src/users/entities/users.entities';
import { Role } from 'src/users/enums/role.enum';
import { UsersService } from 'src/users/services/users.service';
import { Context } from 'telegraf';
import { TelegramService } from './telegram.service';

@Injectable()
export class TelegramAdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly telegramService: TelegramService,
  ) {}


  async adminReq(ctx: any) {
    const id = ctx.match[2];
    const action = ctx.match[1];
    switch (action) {
      case 'decide': {
        await this.decide(ctx, id);
        break;
      }
      case 'accept': {
        await this.accept(ctx, id);
        break;
      }
      case 'decline': {
        await this.decline(ctx, id);
        break;
      }
      case 'makeUser': {
        await this.makeUser(ctx, id);
        break;
      }
    }
  }

  async makeUser(ctx: Context, id: string) {
    const user = await this.usersService.getUserById(id);
    const wholeName = this.telegramService.getFullName(user);
    user.role = Role.CLIENT;
    await this.usersService.save(user);
    await ctx.deleteMessage();
    await ctx.reply(`${wholeName} теперь клиент`);
  }


  async decide(ctx: Context, id: string) {
    const keyboards = await this.telegramService.removeOneElement(ctx);
    if (!keyboards.length) await this.telegramService.removeMessage(ctx);
    const user = await this.usersService.getUserById(id);
    const wholeName = this.telegramService.getNameForReqs(user);
    const buttons = [{
      text: 'Принять', callback_data: `adminReq-(accept)-(${id})`
    }, {
      text: 'Отклонить', callback_data: `adminReq-(decline)-(${id})`
    }];
    await ctx.reply(wholeName, { reply_markup: { inline_keyboard: [buttons] } })
  }

  async accept(ctx: Context, id: string) {
    await this.telegramService.removeMessage(ctx);
    const user = await this.usersService.getUserById(id);
    const wholeName = this.telegramService.getFullName(user);
    const result = await this.makeOperator(ctx, id);
    if (result) {
      await ctx.reply(`Пользователь ${wholeName} - теперь оператор`);
      await ctx.telegram.sendMessage(user.telegramId, 'Ваша заявка в операторы одобрена')
    }
  }

  async decline(ctx: Context, id: string) {
    await this.telegramService.removeMessage(ctx);
    const user = await this.usersService.getUserById(id);
    const wholeName = this.telegramService.getFullName(user);
    user.operatorReqPending = null;
    await this.usersService.save(user);
    await ctx.reply(`Заявка по пользователю ${wholeName} отклонена`);
    await ctx.telegram.sendMessage(user.telegramId, 'Ваша заявка в операторы отклонена')
  }

  async makeOperator(ctx: Context, id: string) {
    const user = await this.usersService.getUserById(id);
    if (!user) await ctx.reply('Пользователя нет в базе данных, он должен вести /start команду');
    else {
      if (this.isOperator(user)) await ctx.reply('Пользователь уже оператор');
      else {
        user.role = Role.OPERATOR;
        user.operatorReqPending = null;
        return this.usersService.save(user);
      }
    }
  }

  async allOpReq(ctx: Context) {
    const wantsBeOps = await this.usersService.getAllWantsBeOps();
    const backButton = [{ text: 'Назад', callback_data: '/menu' }]
    if (!wantsBeOps.length) {
      await ctx.reply('Заявок пока нет', { reply_markup: { inline_keyboard: [backButton] } });
    } else {
      const buttons = wantsBeOps.map(e => {
        const currName = this.telegramService.getFullName(e);
        return [{ text: currName, callback_data: `adminReq-(decide)-(${e.id})` }];
      });
      buttons.push(backButton);
      await ctx.reply('Активные заявки в операторы', { reply_markup: { inline_keyboard: buttons } })
    }

  }

  async showAllOps(ctx: Context) {
    const users = await this.usersService.getAllOperators();
    const backButton = [{ text: 'Назад', callback_data: '/menu' }]
    if (!users.length) {
      return await ctx.reply('Операторов нет', { reply_markup: { inline_keyboard: [backButton] } });
    } else {
      const messages = users.map(e => {
        const wholeName = this.telegramService.getFullName(e);
        const currTime = this.telegramService.getTime(e.updatedAt);
        return `${wholeName}, добавлен ${currTime}`;
      });
      await ctx.reply(messages.join('\n'), { reply_markup: { inline_keyboard: [backButton] } });
    }
  }

  async showAllOpsWithRemovableBtn(ctx: Context) {
    const users = await this.usersService.getAllOperators();
    const backButton = [{ text: 'Назад', callback_data: '/menu' }]
    if (!users.length) {
      return await ctx.reply('Операторов нет', { reply_markup: { inline_keyboard: [backButton] } });
    } else {
      const buttons = users.map(e => {
        const wholeName = this.telegramService.getFullName(e);
        return [{ text: wholeName, callback_data: `adminReq-(makeUser)-(${e.id})` }]
      });
      buttons.push(backButton);
      await ctx.reply('Операторы', { reply_markup: { inline_keyboard: buttons } });
    }

  }


  isOperator(user: UsersEntity) {
    return user.role === Role.OPERATOR;
  }

}