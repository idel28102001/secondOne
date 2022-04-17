import { Context, Wizard, WizardStep } from 'nestjs-telegraf'
import { CURRENCY, RESERVE } from 'src/common/constants';
import { TRC20IsValid } from 'src/common/validate';
import { RequestsService } from 'src/requests/service/requests.service';
import { Scenes } from 'telegraf'

@Wizard('buy')
export class BuyWizard {
  constructor(
    private readonly requestsService: RequestsService,
  ) {}

  private readonly request: Record<string, string | number> = {};
  private timeStamp: any;

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
    this.request.count = Number(num);
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
      this.request.wallet = wallet;
      this.request.rate = CURRENCY;
      const result = ctx as any;
      const tgId = result.update.message.from.id;
      const req = await this.requestsService.createReq(this.request, tgId, ctx);
      await ctx.reply(`Заявка #${req.id} обмен ${req.money} RUB на ${req.count} USDT создана\nКошелек ${req.wallet}\nОжидайте ответа оператора`);
      clearTimeout(this.timeStamp);
      ctx.scene.leave()
    }
  }
}