import { Injectable } from '@nestjs/common';
import { RequestsService } from 'src/requests/service/requests.service';
import { UsersEntity } from 'src/users/entities/users.entities';
import { Role } from 'src/users/enums/role.enum';
import { UsersService } from 'src/users/services/users.service';
import { Context } from 'telegraf';
import { Context as Ctx } from 'vm';
import { TelegramService } from './telegram.service';

@Injectable()
export class TelegramOperatorService {
  constructor(
    private readonly usersService: UsersService,
    private readonly telegramService: TelegramService,
    private readonly requestsService: RequestsService,
  ) {}

  async actions(ctx: Context) {
    const cntx = ctx as Ctx;
    const action = cntx.match[1];
    switch (action) {
      case 'accept-req': {
        const reqId = cntx.match[3];
        await this.acceptReq(ctx, reqId)
        break;
      }
    }
  }


  async acceptReq(ctx: Ctx, reqId: string) {
    const request = await this.requestsService.findById(reqId, { relations: ['user'] });


    const allOps = await this.usersService.getAllOperators();
    const allMess = JSON.parse(request.messages);


    const resOps = allOps.filter(e => e.telegramId !== ctx.update.callback_query.from.id);
    const resMess = allMess.filter(e => !resOps.map(e => e.telegramId).includes(e.telegramId));
    console.log(JSON.parse(request.messages), resOps.map(e => e.telegramId));
    console.log(allMess, allOps, 123, resMess, resOps);
    // await Promise.all(resOps.map(async e=> {
    //   await 
    // }));
  }
}
