import { Role } from '../enums/role.enum';

export class UserDto {
  firstName?: string;
  lastName?: string;
  username?: string;
  telegramId: number;
  role?: Role;
}