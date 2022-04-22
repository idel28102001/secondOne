import { RequestsEntity } from 'src/requests/entities/requests.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '../enums/role.enum';
import { WalletsEntity } from './wallets.entities';

@Entity({ name: 'users' })
export class UsersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: '' })
  firstName: string;

  @Column({ default: '' })
  lastName: string;

  @Column({ default: '' })
  username: string;

  @Column({ nullable: true })
  telegramId: number | null;

  @Column({ type: 'enum', default: Role.CLIENT, enum: Role })
  role: Role;

  @Column({ nullable: true })
  operatorReqPending: boolean;

  @OneToMany(() => WalletsEntity, wallet => wallet.user, { cascade: true })
  wallets: WalletsEntity[];

  @OneToMany(() => RequestsEntity, request => request.user, { nullable: true })
  opRequests: RequestsEntity[];

  @OneToMany(() => RequestsEntity, request => request.user, { cascade: true })
  requests: RequestsEntity[];
}