import { Injectable } from '@nestjs/common';
import { CURRENCY, RESERVE } from 'src/common/constants';
import { Context } from 'telegraf';
import { Context as Ctx } from 'vm';

@Injectable()
export class TelegramClientService {


  async clientReply(ctx: Context) {
    const action = (ctx as unknown as Ctx).match[1];
    ctx.deleteMessage();
    switch (action) {
      case 'currency': {
        await this.getCurrency(ctx);
        break;
      }
      case 'exchange': {
        await this.exchange(ctx);
        break;
      }
      case 'buy': {
        await this.buy(ctx);
        break;
      }
      case 'sell': {
        await this.sell(ctx);
        break;
      }
    }
  }

  async getCurrency(ctx: Context) {
    const backButton = [{ text: 'Назад', callback_data: '/menu' }];
    await ctx.reply(`Курс - ${CURRENCY} рублей за 1 USDT`, { reply_markup: { inline_keyboard: [backButton] } });
  }

  async exchange(ctx: Context) {
    const buttons = [[{ text: 'Купить', callback_data: `client-(buy)` }, { text: 'Продать', callback_data: `client-(sell)` }], [{ text: 'Назад', callback_data: '/menu' }]];
    await ctx.reply('Выберите, что хотите сделать:', { reply_markup: { inline_keyboard: buttons } });
  }

  async buy(ctx: any) {
    await ctx.scene.enter('buy');
  }

  async sell(ctx: Context) {
    const backButton = [{ text: 'Назад', callback_data: 'client-(exchange)' }];
    ctx.reply('Продавай!', { reply_markup: { inline_keyboard: [backButton] } });
  }


}