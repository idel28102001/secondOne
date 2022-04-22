import { Injectable } from '@nestjs/common';
import { RequestsEntity } from 'src/requests/entities/requests.entity';
import { RequestsService } from 'src/requests/service/requests.service';
import { UsersEntity } from 'src/users/entities/users.entities';
import { Role } from 'src/users/enums/role.enum';
import { UsersService } from 'src/users/services/users.service';
import { WalletsService } from 'src/users/services/wallets.service';
import { Context } from 'telegraf';
import { Context as Ctx } from 'vm';
import { TelegramService } from './telegram.service';

@Injectable()
export class TelegramOperatorService {
  constructor(
    private readonly usersService: UsersService,
    private readonly telegramService: TelegramService,
    private readonly requestsService: RequestsService,
    private readonly walletsService: WalletsService,
  ) {}

  async actions(ctx: Context) {
    const cntx = ctx as Ctx;
    const action = cntx.match[1];
    const reqId = cntx.match[3];
    switch (action) {
      case 'accept-req': {
        await this.acceptReq(ctx, reqId)
        break;
      }
      case 'sended-money': {
        await this.notifyOperatorYouSent(ctx, reqId);
        break;
      }

      case 'confirm-sended': {
        await this.confirmSended(ctx, reqId);
        break;
      }

      case 'repeat-sended': {
        await this.repeatSended(ctx, reqId);
        break;
      }
    }
  }

  async repeatSended(ctx: Context, reqId: string) {
    const telegramId = (ctx as Ctx).update.callback_query.from.id;
    const requestForRepeat = await this.requestsService.findById(reqId, { relations: ['user'], select: ['id', 'status', 'operatorTelegramId', 'count', 'rate'] });
    const request = await this.markInProgress(requestForRepeat);
    const wallet = await this.walletsService.findDefaultWalletByTgId(telegramId, ctx);
    await this.notifyClientSended(request, ctx, reqId, wallet.wallet);
    await ctx.editMessageText('Ожидайте подтверждения со стороны клиента');
  }


  async confirmSended(ctx: Context, reqId: string) {
    const requestForConfirm = await this.requestsService.findById(reqId, { relations: ['user'], select: ['id', 'status', 'wallet', 'count'] });
    const request = await this.markCompleted(requestForConfirm);
    await ctx.telegram.sendMessage(request.user.telegramId, `На ваш кошелёк ${request.wallet} были отправлены ${request.count} USDT`);
    await ctx.editMessageText(`Заявка #${reqId} закрыта`);
  }



  async notifyOperatorYouSent(ctx: Context, reqId: string) {
    await ctx.editMessageText('Ожидайте подтверждения и перевода оператора');
    const requestForSent = await this.requestsService.findById(reqId, { select: ['operatorTelegramId', 'id', 'status', 'count', 'rate'] });
    const request = await this.markSended(requestForSent);


    // const operator = await this.usersService.getUserByTelegramId(request.operatorTelegramId, ctx, { select: ['wallet'] });
    const wallet = '12211221121212';
    await ctx.telegram.sendMessage(request.operatorTelegramId, `Клиент подтвердил перевод ${request.money()} RUB на карту ${wallet}\nПроверьте, пожалуйста, так ли это.\nЕсли все успешно, нажмите на кнопку "Деньги пришли от клиента"`, { reply_markup: { inline_keyboard: [[{ text: 'Деньги пришли от клиента', callback_data: `op-(confirm-sended)-(${reqId})` }], [{ text: 'Деньги не пришли от клиента', callback_data: `op-(repeat-sended)-(${reqId})` }]] } });
  }




  async acceptReq(ctx: Context, reqId: string) {
    const telegramId = (ctx as Ctx).update.callback_query.from.id;
    const wallet = await this.walletsService.findDefaultWalletByTgId(telegramId, ctx);
    if (!wallet) {
      await (ctx as any).scene.enter('add-wallet');
    } else {
      const requestForAccept = await this.requestsService.findById(reqId, { relations: ['user'], select: ['id', 'count', 'rate', 'wallet', 'operatorTelegramId', 'messages'] });
      const request = await this.markInProgress(requestForAccept, telegramId);
      await this.notifyAllOps(request, ctx, reqId, telegramId);
      await this.notifyClientSended(request, ctx, reqId, wallet.wallet);
    }
  }

  async markCompleted(request: RequestsEntity) {
    request.status = 'Выполнено оператором';
    return await this.requestsService.save(request);
  }

  async markSended(request: RequestsEntity) {
    request.status = 'Клиент отправил';
    return await this.requestsService.save(request);
  }

  async markInProgress(request: RequestsEntity, opTelegramId?: number) {
    request.status = 'В процессе';
    if (opTelegramId !== undefined) {
      request.operatorTelegramId = opTelegramId;
    }
    return await this.requestsService.save(request);
  }


  async notifyAllOps(request: RequestsEntity, ctx: Context, reqId: string, opTelegramId: string) {
    const allMess = JSON.parse(request.messages);
    const resMess = allMess.filter(e => e.chatId !== opTelegramId);
    await Promise.all(resMess.map(async e => {
      await ctx.telegram.editMessageText(e.chatId, e.messageId, '', `Заявка #${reqId} была принята другим оператором`, { reply_markup: null });
    }));
    await ctx.editMessageText(`Вы приняли заявку #${request.id}\nОбмен ${request.money()} RUB на ${request.count} USDT.\nКурс 1 USDT = ${request.rate} RUB\nНомер кошелька ${request.wallet}\n`, { reply_markup: null });
  }

  async notifyClientSended(request: RequestsEntity, ctx: Context, reqId: string, wallet: string) {
    await ctx.telegram.sendMessage(request.user.telegramId, `От Вас ожидается поступление ${request.money()} RUB на номер карты ${wallet}`, { reply_markup: { inline_keyboard: [[{ text: `Я отправил деньги`, callback_data: `op-(sended-money)-(${reqId})` }]] } });
  }
}
