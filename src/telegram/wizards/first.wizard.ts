import { Context, Wizard, WizardStep } from 'nestjs-telegraf'
import { Scenes } from 'telegraf'

@Wizard('add-op')
export class TestWizard {
  @WizardStep(1)
  async step1(@Context() ctx: Scenes.WizardContext) {
    ctx.reply('Введи id пользователя');
    ctx.wizard.next()
  }

  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    ctx.reply('Молодцом')
    const result = ctx.update as unknown as { message: { text: string } };
    console.log(result.message.text);
    ctx.scene.leave()
  }
}