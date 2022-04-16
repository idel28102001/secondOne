import { Action, Hears, Start, Update } from 'nestjs-telegraf';
import { UsersService } from 'src/users/services/users.service';
import { Context } from 'telegraf';
import { TelegramAdminService } from '../services/telegram-admin.service';
import { TelegramClientService } from '../services/telegram-client.service';
import { TelegramMainService } from '../services/telegram-main.service';


@Update()
export class TelegramUpdate {
  constructor(
    private readonly usersService: UsersService,
    private readonly telegramMainService: TelegramMainService,
    private readonly telegramAdminService: TelegramAdminService,
    private readonly telegramClientService: TelegramClientService,
  ) {}

  @Start()
  async startCommand(ctx: any) {
    const { id, first_name, last_name, username } = ctx.update.message.from;
    await this.usersService.register({ telegramId: id, firstName: first_name, lastName: last_name, username });
    ctx.reply('Начало положено');
    //ctx.scene.enter('test');
  }

  @Hears(/^\/menu$/i)
  @Action(/\/menu/)
  async hear(ctx: any) {
    ctx.deleteMessage();
    const { id } = ctx.update.message ? ctx.update.message.from : ctx.update.callback_query.message.chat;
    await this.telegramMainService.sendKeyboard(ctx, id);
  }

  @Hears(/^\/wanttobeoperator$/)
  async beOperator(ctx: any) {
    const { id } = ctx.update.message.from;
    await this.telegramMainService.beOperator(ctx, id);
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
  async admin(ctx: any) {
    await this.telegramMainService.adminReply(ctx)
  }

  @Action(/^adminReq-\(([a-zA-Z]+?)\)-?\(([a-zA-Z0-9\-]+?)\)?$/g)
  async adminReq(ctx: any) {
    await this.telegramAdminService.adminReq(ctx);
  }

  @Action(/^client-\(([a-zA-Z\-]+?)\)$/)
  async client(ctx: Context) {
    await this.telegramClientService.clientReply(ctx);
  }

}
