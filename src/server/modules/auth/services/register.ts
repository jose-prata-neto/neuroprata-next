import { Service } from '@/interfaces/service';
import type { UserCreate } from '@/server/db/schema';
import type { IAuthRepository } from '../repository';

export class RegisterService extends Service<
  IAuthRepository,
  UserCreate,
  string | null
> {
  async execute(args: UserCreate): Promise<string | null> {
    return await this.repository.register(args);
  }
}
