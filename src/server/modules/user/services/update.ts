import { Service } from '@/interfaces/service';
import type { User, UserUpdate } from '@/server/db/schema/user';
import type { IUserRepository } from '../repository';

export class UpdateUserService extends Service<
  IUserRepository,
  { id: string; data: UserUpdate },
  User | null
> {
  async execute({ id, data }: { id: string; data: UserUpdate }) {
    return await this.repository.update(id, data);
  }
}
