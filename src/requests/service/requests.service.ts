import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { config } from 'src/common/config';
import { UsersEntity } from 'src/users/entities/users.entities';
import { UsersService } from 'src/users/services/users.service';
import { Context } from 'telegraf';
import { FindOneOptions, Repository } from 'typeorm';
import { RequestsEntity } from '../entities/requests.entity';
import { messagesArrayInterface } from '../interfaces/messages-array.interface';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(RequestsEntity)
    private readonly requestRepostitory: Repository<RequestsEntity>,
    private readonly usersService: UsersService,
  ) {}

  async createReq(data: any, tgId: number, ctx: Context) {
    const user = await this.usersService.getUserByTelegramId(tgId, ctx, { relations: ['requests'] });
    const req = this.requestRepostitory.create(data) as unknown as RequestsEntity;
    user.requests.push(req);
    const result = await this.usersService.save(user);
    const last = result.requests.slice(-1)[0];
    const money = Math.round(last.count * last.rate * 100) / 100;


    const ops = await this.usersService.getAllOperators();
    const messArray = [];
    await Promise.all(ops.map(async e => {
      const text = `Заявка #${last.id} обмен ${money} RUB на ${last.count} USDT\nКурс 1 USDT = ${last.rate} RUB`;
      const res = await ctx.telegram.sendMessage(e.telegramId, text, { reply_markup: { inline_keyboard: [[{ text: 'Принять', callback_data: `op-(accept-req)-(${last.id})` }]] } });
      messArray.push({ chatId: res.chat.id, messageId: res.message_id });
    }))

    last.messages = JSON.stringify(messArray);
    await this.requestRepostitory.save(last);
    setTimeout(this.makeExpired.bind(null, req.id, this.requestRepostitory, this, ctx, messArray), Number(config.getTimeExpire()));
    return last;
  }

  async makeExpired(reqId: string, reqRep: Repository<RequestsEntity>, reqService: RequestsService, ctx: Context, messArray: messagesArrayInterface[]) {
    const req = await reqRep.findOne(reqId);
    if (req.status === 'Новая') {
      req.status = 'Истекла';
      const res = await reqService.save(req);
      await ctx.reply(`Заявка #${res.id} истекла по времени`);
      await Promise.all(messArray.map(async (op) => {
        await ctx.telegram.editMessageText(op.chatId, op.messageId, '', `Заявка #${reqId} истекла по времени`, { reply_markup: null })
      }))
    }

  }


  async save(data: any): Promise<RequestsEntity> {
    return await this.requestRepostitory.save(data);
  }

  async findById(id: string, options?: FindOneOptions<RequestsEntity>): Promise<RequestsEntity> {
    return await this.requestRepostitory.findOne(id, options);
  }


}
