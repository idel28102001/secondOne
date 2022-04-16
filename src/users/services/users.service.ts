import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from '../dto/user.dto';
import { UsersEntity } from '../entities/users.entities';
import { Role } from '../enums/role.enum';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(UsersEntity) private readonly usersRepository: Repository<UsersEntity>) {}

  async register(data: UserDto) {
    console.log(data);
    const check = await this.usersRepository.findOne({ where: { telegramId: data.telegramId } });
    if (!check) {
      const res = this.usersRepository.create(data);
      return await this.usersRepository.save(res);
    }
  }

  async getUserByUsername(username: string, ctx: any) {
    const user = await this.usersRepository.findOne({ where: { username } });
    console.log(user);
    if (!user) await this.notFound(ctx);
    return user;
  }

  async getAllWantsBeOps() {
    return await this.usersRepository.find({ where: { role: Role.CLIENT, operatorReqPending: true } })
  }

  async getAllOperators() {
    return await this.usersRepository.find({ where: { role: Role.OPERATOR }, select: ['updatedAt', 'username', 'lastName', 'firstName', 'id'] });
  }

  async getAllAdmins() {
    return await this.usersRepository.find({ where: { role: Role.ADMIN } });
  }

  async notFound(ctx: any) {
    await ctx.reply('Пользователя нет в базе данных - введите команду /start для записи в базу');
  }

  async getUserByTelegramId(telegramId: number, ctx: any) {
    const user = await this.usersRepository.findOne({ where: { telegramId } });
    if (!user) await this.notFound(ctx);
    return user;
  }

  async getUserById(id: string, ctx: any) {
    return await this.usersRepository.findOne(id, { select: ['firstName', 'lastName', 'username', 'id', 'operatorReqPending', 'telegramId'] });
  }

  async save(data: UsersEntity) {
    return await this.usersRepository.save(data);
  }

}
