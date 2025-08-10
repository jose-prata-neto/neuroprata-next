import { db } from '@/server/db';
import { type IUserRepository, UserRepository } from './repository';
import {
  DeleteUserService,
  FindAllUsersService,
  FindUserByIDService,
  UpdateUserService,
} from './services';

function userFactory<T>(Service: new (repository: IUserRepository) => T) {
  return new Service(new UserRepository(db));
}

const deleteUserService = userFactory(DeleteUserService);
const updateUserService = userFactory(UpdateUserService);
const findAllUsersService = userFactory(FindAllUsersService);
const findUserByIDService = userFactory(FindUserByIDService);

const userServices = {
  delete: deleteUserService,
  update: updateUserService,
  findAll: findAllUsersService,
  findById: findUserByIDService,
};

export { userServices };
