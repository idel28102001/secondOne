import { Action, Hears, Start, Update } from 'nestjs-telegraf';
import { UsersService } from 'src/users/services/users.service';
import { Context } from 'telegraf';
import { TelegramAdminService } from '../services/telegram-admin.service';
import { TelegramClientService } from '../services/telegram-client.service';
import { TelegramMainService } from '../services/telegram-main.service';
import { TelegramOperatorService } from '../services/telegram-operator.service';


@Update()
export class TelegramUpdate {
  constructor(
    private readonly usersService: UsersService,
    private readonly telegramMainService: TelegramMainService,
    private readonly telegramAdminService: TelegramAdminService,
    private readonly telegramClientService: TelegramClientService,
    private readonly telegramOperatorService: TelegramOperatorService,
  ) {}

  @Start()
  async startCommand(ctx: any) {
    const { id, first_name, last_name, username } = ctx.update.message.from;
    await this.usersService.register({ telegramId: id, firstName: first_name, lastName: last_name, username });
    await ctx.reply('Начало положено');
  }

  @Hears(/^\/menu$/i)
  @Action(/\/menu/)
  async hear(ctx: any) {
    await ctx.deleteMessage();
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

  @Action(/^op-\(([a-zA-Z\-]+?)\)(-\(([0-9]+?)\))?$/)
  async op(ctx: any) {
    await this.telegramOperatorService.actions(ctx);
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
