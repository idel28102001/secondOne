import { Injectable } from '@nestjs/common';
import { compare } from 'src/common/sort';
import { Role } from 'src/users/enums/role.enum';
import { UsersService } from 'src/users/services/users.service';
import { WalletsService } from 'src/users/services/wallets.service';
import { Context } from 'telegraf';
import { Context as Ctx } from 'vm';

@Injectable()
export class TelegramCommonService {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly usersService: UsersService) {}


  async commonAction(ctx: Context) {
    const cntx = ctx as Ctx;
    const { id } = cntx.update.message ? cntx.update.message.from : cntx.update.callback_query.message.chat;
    const user = await this.usersService.getUserByTelegramId(id, ctx, { select: ['id', 'role'] });
    const action = cntx.match[1];
    switch (action) {
      case 'settings': {
        await this.settings(ctx, user.role);
        break;
      }
      case 'change-wallets': {
        await this.changeWallets(ctx);
        break;
      }

      case 'add': {
        await this.addWallet(ctx);
        break;
      }
      case 'wallet': {
        const id = cntx.match[3];
        await this.wallet(ctx, id);
        break;
      }
      case 'delete': {
        const id = cntx.match[3];
        await this.deleteWallet(ctx, id);
        break;
      }
      case 'default': {
        const id = cntx.match[3];
        await this.setWalletDefault(ctx, id);
      }
    }
  }

  async setWalletDefault(ctx: Context, id: string) {
    const wallet = await this.walletsService.findByID(id,
      { select: ['id', 'default', 'wallet'], relations: ['user', 'user.wallets'] }
    );
    const user = wallet.user;
    user.wallets.map(e => {
      e.default = e.id === Number(id);
    });
    await this.usersService.save(user);
    await ctx.editMessageText(`Вы сделали карту ${wallet.wallet} по умолчанию`);
  }


  async deleteWallet(ctx: Context, id: string) {
    const wallet = await this.walletsService.findByID(id,
      { select: ['id', 'default', 'wallet'], relations: ['user', 'user.wallets'] })
    console.log(wallet);
    //   const user = wallet.user;
    //   await this.walletsService.delete(id);
    //   const wallets = user.wallets.filter(e => e.id !== Number(id));
    //   if (wallets.length && !wallets.find(e => e.default)) {
    //     wallets[0].default = true;
    //     await this.usersService.save({ id: user.id, wallets: wallets })
    //   }
    //   await ctx.editMessageText('Вы успешно удалили карту');
  }

  async wallet(ctx: Context, id: string) {
    const wallet = await this.walletsService.findByID(id);
    const buttons = [
      [{ text: 'Сделать картой по умолчанию', callback_data: `common-(default)-(${id})` }],
      [
        { text: 'Назад', callback_data: `common-(change-wallets)` },
        { text: 'Удалить', callback_data: `common-(delete)-(${id})` }
      ]
    ];
    await ctx.editMessageText(wallet.wallet, { reply_markup: { inline_keyboard: buttons } })
  }




  async settings(ctx: Context, role: Role) {
    const buttons = [[{ text: 'Кошельки', callback_data: 'common-(change-wallets)' }]];

    switch (role) {
      case Role.CLIENT: {
        break;
      }
      case Role.OPERATOR: {
        break;
      }
    }
    buttons.push([{ text: 'Назад', callback_data: '/menu' }]);
    await ctx.editMessageText('Настройки оператора', { reply_markup: { inline_keyboard: buttons } })
  }


  async addWallet(ctx: Context) {
    await ctx.deleteMessage();
    await (ctx as any).scene.enter('add-wallet');
  }

  async changeWallets(ctx: Context) {
    const tgId = (ctx as Ctx).update.callback_query.from.id;
    const user = await this.usersService.getUserByTelegramId(tgId, ctx, { relations: ['wallets'], select: ['wallets', 'id'] });
    if (user) {
      const text = user.wallets.length ? 'Кошельки' : 'Кошельков пока нет';
      const wallets = user.wallets
        .sort(compare)
        .map(e => {
          const text = e.default ? '(Выбрано)' : '';
          return [{ text: `${e.wallet} ${text}`, callback_data: `common-(wallet)-(${e.id})` }];
        });
      const buttons = [{ text: 'Назад', callback_data: `common-(settings)` }, { text: 'Добавить', callback_data: `common-(add)` }]
      wallets.push(buttons);
      await ctx.editMessageText(text, { reply_markup: { inline_keyboard: wallets } });
    }

  }



}
