import e from 'express';
import { Context, Wizard, WizardStep } from 'nestjs-telegraf'
import { WalletIsValid } from 'src/common/validate';
import { UsersEntity } from 'src/users/entities/users.entities';
import { WalletsEntity } from 'src/users/entities/wallets.entities';
import { UsersService } from 'src/users/services/users.service';
import { WalletsService } from 'src/users/services/wallets.service';
import { Scenes } from 'telegraf'
import { Context as Ctx } from 'vm';

@Wizard('add-wallet')
export class AddWalletWizard {
  constructor(
    private readonly usersService: UsersService,
    private readonly walletsService: WalletsService,
  ) {}

  @WizardStep(1)
  async step1(@Context() ctx: Scenes.WizardContext) {
    await ctx.reply('Введите номер кошелька. Для отмены введите /exit');
    ctx.wizard.next();
  }


  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    const result = ctx.update as unknown as { message: { text: string } };
    const wallet = result.message.text;
    if (wallet === '/exit') {
      const id = (ctx as Ctx).update.message.message_id;
      await ctx.deleteMessage();
      await ctx.deleteMessage(id - 1);
      ctx.scene.leave();
      return;
    }


    const tgId = (ctx as Ctx).update.message.chat.id;
    const operator = await this.usersService.getUserByTelegramId(tgId, ctx, { relations: ['wallets'], select: ['id', 'wallets'] });
    if (!WalletIsValid(wallet)) {
      await ctx.reply('Невалидный кошелёк. Введите повторно номер');
      ctx.wizard.selectStep(1);
    } else {
      const walletE = this.walletsService.create({ wallet }) as any as WalletsEntity;
      operator.wallets.map(e => {
        e.default = false;
      });
      operator.wallets.push(walletE);
      await this.usersService.save(operator);
      await ctx.reply('Номер кошелька записан в базу');
      await ctx.scene.leave();
    }
  }

}