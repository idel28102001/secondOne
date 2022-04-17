import { Context, Wizard, WizardStep } from 'nestjs-telegraf'
import { RESERVE } from 'src/common/constants';
import { TRC20IsValid } from 'src/common/validate';
import { Scenes } from 'telegraf'

@Wizard('buy')
export class TestWizard {

  private readonly requst = new Map();

  async deleteMessages(ctx: Scenes.WizardContext) {
    await ctx.deleteMessage(ctx.message.message_id - 1);
    await ctx.deleteMessage(ctx.message.message_id);
  }


  @WizardStep(1)
  async step1(@Context() ctx: Scenes.WizardContext) {
    await ctx.reply(`Наш резерв - ${RESERVE} USDT\nВведите нужную сумму`);
    ctx.wizard.next()
  }

  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    const result = ctx.update as unknown as { message: { text: string } };
    const num = result.message.text;
    await this.deleteMessages(ctx);
    if (!/\d+?/.test(num)) {
      await ctx.reply('Введенное значение не является числом. Введите корректное значение.');
      ctx.wizard.selectStep(1);
      return;
    }
    if (Number(num) > RESERVE) {
      await ctx.reply(`Введённое значение превышает резерв. Введите число не превышающее резерев - (${RESERVE})`);
      ctx.wizard.selectStep(1);
      return;
    }
    this.requst.set('number', Number(num));
    await ctx.reply('Введите адрес вашего TRC20 кошелька')
    ctx.wizard.next();
  }

  @WizardStep(3)
  async step3(@Context() ctx: Scenes.WizardContext) {
    const result = ctx.update as unknown as { message: { text: string } };
    const wallet = result.message.text;
    await this.deleteMessages(ctx);
    if (!TRC20IsValid(wallet)) {
      await ctx.reply("Ошибка. Невалидный кошелёк. Введите корректный номер кошелька")
      ctx.wizard.selectStep(2);
    }
    else {
      this.requst.set('wallet', wallet);
      await ctx.reply('Ваша заявка сформирована');
      console.log(this.requst.entries());
      ctx.scene.leave()
    }
  }
}