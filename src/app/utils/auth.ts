import jwt from 'jsonwebtoken';

import authConfig from '@config/auth';
import { RequestError } from '@errors/request';
import { getRepository } from 'typeorm';
import { User } from '@entity/user';

interface TokenObject {
  id: number;
}

export function encodeToken(objectToEncode: TokenObject) {
  return jwt.sign({ id: objectToEncode.id }, authConfig.appSecret);
}

export async function decodeToken(token: string) {
  try {
    const tokenDecoded = jwt.verify(token, authConfig.appSecret);
    // const tokenDecoded = await promisify(jwt.verify)(token, authConfig.appSecret);

    return tokenDecoded as TokenObject;
  } catch (err) {
    return undefined;
  }
}

export async function validateTokenAndGetUser(authToken?: string) {
  if (!authToken) {
    throw new RequestError('Token not provided', 401);
  }

  const [, token] = authToken.split(' ');
  const tokenDecoded = await decodeToken(token);

  if (!tokenDecoded) {
    throw new RequestError('Token Invalid', 401);
  }

  const user = await getRepository(User).findOne({
    where: {
      id: tokenDecoded.id,
    },
  });

  if (!user) {
    throw new RequestError('User not found', 401);
  }

  return user;
}
