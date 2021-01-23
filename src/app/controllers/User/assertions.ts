import { User } from '@entity/user';
import { RequestError } from '@errors/request';
import { getRepository } from 'typeorm';

interface UserExistsParams {
  id?: number;
  email?: string;
}

export async function assertUserExists(params: UserExistsParams) {
  const user = await getRepository(User).findOne(params);

  if (!user) {
    throw new RequestError('User not found');
  }

  return user;
}
