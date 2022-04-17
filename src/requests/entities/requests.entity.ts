import { UsersEntity } from 'src/users/entities/users.entities';
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'requests' })
export class RequestsEntity {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  rate: number;

  @Column({ nullable: true })
  count: number;

  @Column({ nullable: true })
  wallet: string;

  @Column({ default: 'Новая' })
  status: string;

  @Column('json', {nullable: true})
  messages: string;

  @ManyToOne(() => UsersEntity, user => user.requests, { 'onDelete': 'CASCADE' })
  user: UsersEntity;

}