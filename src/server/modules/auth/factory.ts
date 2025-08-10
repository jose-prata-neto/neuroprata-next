import { db } from '@/server/db';
import { AuthRepository, type IAuthRepository } from './repository';
import { LoginService, RegisterService } from './services';

function authFactory<T>(Service: new (repository: IAuthRepository) => T) {
  return new Service(new AuthRepository(db));
}

const registerService = authFactory(RegisterService);
const loginService = authFactory(LoginService);

const authServices = {
  register: registerService,
  login: loginService,
};

export { authServices };
