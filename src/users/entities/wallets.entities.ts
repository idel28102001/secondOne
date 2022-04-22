import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from './users.entities';

@Entity({ name: 'wallets' })
export class WalletsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  wallet: string;

  @Column({ default: true })
  default: boolean;

  @ManyToOne(() => UsersEntity, user => user.wallets)
  user: UsersEntity;
}