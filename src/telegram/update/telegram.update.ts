import { Action, Hears, Message, On, Start, Update } from 'nestjs-telegraf';
import { UsersService } from 'src/users/services/users.service';
import { Context } from 'vm';
import { Context as Ctx, Scenes } from 'telegraf';
import { TelegramService } from '../services/telegram.service';
import { callback } from 'telegraf/typings/button';


@Update()
export class TelegramUpdate {
  constructor(
    private readonly usersService: UsersService,
    private readonly telegramService: TelegramService,
  ) {}

  @Start()
  async startCommand(ctx: any) {
    const { id, first_name, last_name, username } = ctx.update.message.from;
    await this.usersService.register({ telegramId: id, firstName: first_name, lastName: last_name, username });
    ctx.reply('Начало положено');
    //ctx.scene.enter('test');
  }

  @Hears(/^[М | м]еню$/i)
  async hear(ctx: any) {
    const { username, id } = ctx.update.message.from;
    await this.telegramService.sendKeyboard(ctx, username, id);
  }

  @Hears(/^\/wanttobeoperator$/)
  async beOperator(ctx: any) {
    const { id } = ctx.update.message.from;
    await this.telegramService.beOperator(ctx, id);
  }

  @Action(/^watch-\((.+)\)$/)
  async watch(ctx: any) {
    const res = ctx.match[1];
    await ctx.reply(`${res} - Ссылка будет после доработки сервера`);
  }

  @Action(/^op-\((.+)\)$/)
  async op(ctx: any) {
    const res = ctx.match[1];
    await ctx.reply(`${res} - Информация будет по обновлении`);
  }

  @Action(/^admin-\(([a-zA-Z]+?)\)$/g)
  async admin(ctx: Ctx) {
    await this.telegramService.adminReply(ctx)
  }

  @Action(/^adminReq-\((.+?)\)$/g)
  async adminActions(ctx: Ctx) {
assaasasas
    //////
    await this.telegramService.adminReply(ctx)
  }

}
