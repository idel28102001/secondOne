import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '../enums/role.enum';

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
}