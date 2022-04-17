import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from 'src/users/entities/users.entities';
import { UsersService } from 'src/users/services/users.service';
import { Context } from 'telegraf';
import { Repository } from 'typeorm';
import { RequestsEntity } from '../entities/requests.entity';

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
      const res = await ctx.telegram.sendMessage(e.telegramId, text, { reply_markup: { inline_keyboard: [[{ text: 'Принять', callback_data: 'ops-(accept)-(1221212121)' }]] } });
      messArray.push({ chatId: res.chat.id, messageId: res.message_id });
    }))

    const timeStamp = setTimeout(this.makeExpired.bind(null, req, this, ctx), 15 * 60000);
    return last;
  }

  async makeExpired(req: RequestsEntity, reqService: RequestsService, ctx: Context) {
    req.expired = true;
    const res = await reqService.save(req);
    await ctx.reply(`Заявка #${res.id} истекла по времени`);
  }


  async save(data: any): Promise<RequestsEntity> {
    return await this.requestRepostitory.save(data);
  }


}
