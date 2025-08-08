import type { Service } from "@/interfaces/service";
import { type IAuthRepository } from "../repository";

export class LoginService
  implements
    Service<
      IAuthRepository,
      { email: string; password: string },
      string | null
    >
{
  constructor(public repository: IAuthRepository) {}

  async execute(args: {
    email: string;
    password: string;
  }): Promise<string | null> {
    const { email, password } = args;
    return this.repository.login(email, password);
  }
}
