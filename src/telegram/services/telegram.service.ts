import { Injectable } from '@nestjs/common';
import { UsersEntity } from 'src/users/entities/users.entities';
import { Context } from 'telegraf';

@Injectable()
export class TelegramService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  async removeOneElement(ctx: any) {
    const callbackData = ctx.update.callback_query.data;
    const keyboards = ctx.update.callback_query.message.reply_markup.inline_keyboard;
    const keyOfKeyboards = keyboards.map(e => e[0].callback_data);
    const index = keyOfKeyboards.indexOf(callbackData);
    if (index !== -1) {
      keyboards.splice(index, 1);
    }
    await ctx.editMessageReplyMarkup({ inline_keyboard: keyboards });
    return keyboards;
  }

  async removeAdvancedElement(ctx: any) {
    const callbackData = ctx.update.callback_query.data;
    const keyboards = ctx.update.callback_query.message.reply_markup.inline_keyboard;
    let size = 0;
    const keyOfKeyboards = keyboards.map(e => e.map(e => {
      size++;
      return e.callback_data
    }));
    if (size <= 1) {
      return await ctx.deleteMessage();
    }
    let i = 0;
    let resInd: number;
    keyOfKeyboards.forEach(e => {
      if (e.includes(callbackData)) {
        resInd = i;
      }
      i++;
    });
    if (resInd !== undefined) {
      const index = keyOfKeyboards[resInd].indexOf(callbackData);
      if (index !== -1) {
        keyboards[resInd].splice(index, 1);
      }
      await ctx.editMessageReplyMarkup({ inline_keyboard: keyboards });
      return keyboards;
    }
  }


  async removeMessage(ctx: Context) {
    await ctx.deleteMessage();
  }

  getFullName(user: UsersEntity) {
    let result = '';
    result += user.username ? `@${user.username} - ` : '';
    result += user.firstName ? `${user.firstName}` : '';
    result += user.lastName ? ` ${user.lastName}` : '';
    return result;
  }

  getNameForReqs(user: UsersEntity) {
    let result = '';
    result += user.username ? `@${user.username}\n` : '';
    result += user.firstName ? `${user.firstName}` : '';
    result += user.lastName ? ` ${user.lastName}\n` : '\n';
    result += `${this.getTime(new Date())}`;
    return result;
  }

  getTime(time: Date) {
    const month = (time.getMonth() + 1).toString().padStart(2, '0');
    const day = (time.getDate()).toString().padStart(2, '0');
    return `${day}.${month}.${time.getFullYear()} в ${time.getHours()}:${time.getMinutes()}`;
  }

}
