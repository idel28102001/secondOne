import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './entities/users.entities';
import { WalletsEntity } from './entities/wallets.entities';
import { UsersService } from './services/users.service';
import { WalletsService } from './services/wallets.service';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity, WalletsEntity])],
  providers: [UsersService, WalletsService],
  exports: [UsersService, WalletsService],
})
export class UsersModule {}
