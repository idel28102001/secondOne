import { Context, Wizard, WizardStep } from 'nestjs-telegraf'
import { RESERVE } from 'src/common/constants';
import { Scenes } from 'telegraf'

@Wizard('buy')
export class TestWizard {
  @WizardStep(1)
  async step1(@Context() ctx: Scenes.WizardContext) {
    await ctx.reply(`Наш резерв - ${RESERVE} USDT\nВведите нужную сумму`);
    ctx.wizard.next()
  }

  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    await ctx.deleteMessage();
    const result = ctx.update as unknown as { message: { text: string } };
    const num = result.message.text;
    if (!/\d+?/.test(num)) {
      await ctx.reply('Введенное значение не является числом');
      return await ctx.scene.leave();
    }
    if (Number(num) > RESERVE) {
      await ctx.reply('Введённое значение превышает резерв');
      return await ctx.scene.leave();
    }
    ctx.wizard.next();
  }

  @WizardStep(3)
  async step3(@Context() ctx: Scenes.WizardContext) {
    const some = 3;
    if (some === 3) {
      await ctx.reply('Ошибка');
      ctx.scene.reset();
    }
    ctx.reply('Молодцом')
    const result = ctx.update as unknown as { message: { text: string } };
    console.log(result.message.text);
    ctx.scene.leave()
  }
}