import { UsersEntity } from 'src/users/entities/users.entities';
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  money(): number {
    return Math.round(this.count * this.rate * 100) / 100;
  }

  @Column({ nullable: true })
  wallet: string;

  @Column({ default: 'Новая' })
  status: string;

  @Column('json', { nullable: true })
  messages: string;

  @Column({ nullable: true })
  operatorTelegramId: number;

  @ManyToOne(() => UsersEntity, user => user.requests, { 'onDelete': 'CASCADE' })
  user: UsersEntity;


  @ManyToOne(() => UsersEntity, request => request.opRequests)
  operator: UsersEntity[];

}