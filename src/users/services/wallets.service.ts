import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Context } from 'telegraf';
import { FindOneOptions, Repository } from 'typeorm';
import { WalletsEntity } from '../entities/wallets.entities';
import { UsersService } from './users.service';

@Injectable()
export class WalletsService {

  constructor(
    @InjectRepository(WalletsEntity)
    private readonly walletsRepository: Repository<WalletsEntity>,
    private readonly usersService: UsersService,
  ) {}

  create(data) {
    return this.walletsRepository.create(data);
  }

  async findByID(id: string, options?: FindOneOptions<WalletsEntity>) {
    return await this.walletsRepository.findOne(id, options);
  }

  async delete(id: string) {
    return await this.walletsRepository.delete(id);
  }

  async findDefaultWalletByTgId(tgId: number, ctx: Context) {
    const opWallet = await this.usersService.getUserByTelegramId(tgId, ctx, { select: ['id', 'wallets'], relations: ['wallets'] });
    return opWallet.wallets.find(e => e.default);
  }
}
