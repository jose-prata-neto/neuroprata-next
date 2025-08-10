import { Service } from '@/interfaces/service';
import type { UserLogin } from '@/server/db/schema';
import type { IAuthRepository } from '../repository';

export class LoginService extends Service<
  IAuthRepository,
  UserLogin,
  string | null
> {
  async execute(args: UserLogin): Promise<string | null> {
    const { email, password } = args;
    return await this.repository.login(email, password);
  }
}
