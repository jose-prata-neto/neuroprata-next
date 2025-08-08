import type { Service } from "@/interfaces/service";
import type { IUserRepository } from "../repository";
import { UserUpdate, User } from "@/server/db/schema/user";

export class UpdateUserService
  implements
    Service<IUserRepository, { id: string; data: UserUpdate }, User | null>
{
  constructor(public repository: IUserRepository) {
    this.repository = repository;
  }

  async execute({ id, data }: { id: string; data: UserUpdate }) {
    return await this.repository.update(id, data);
  }
}
