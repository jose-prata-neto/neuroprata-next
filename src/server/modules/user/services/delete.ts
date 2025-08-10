import { Service } from '@/interfaces/service';
import type { IUserRepository } from '../repository';

export class DeleteUserService extends Service<
  IUserRepository,
  string,
  boolean
> {
  async execute(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }
}
