import { Service } from '@/interfaces/service';
import type { User } from '@/server/db/schema/user';
import type { IUserRepository } from '../repository';

export class FindAllUsersService extends Service<
  IUserRepository,
  void,
  User[]
> {
  async execute() {
    return await this.repository.findAll();
  }
}
