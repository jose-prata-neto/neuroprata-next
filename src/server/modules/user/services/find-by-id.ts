import { Service } from '@/interfaces/service';
import type { User } from '@/server/db/schema/user';
import type { IUserRepository } from '../repository';

export class FindUserByIDService extends Service<
  IUserRepository,
  string,
  User | null
> {
  async execute(id: string) {
    return await this.repository.findById(id);
  }
}
