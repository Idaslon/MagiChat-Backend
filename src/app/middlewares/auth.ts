import { Request, Response, NextFunction } from 'express';

import { validateTokenAndGetUser } from '@utils/auth';
import { RequestError } from '@errors/request';

interface AuthRequest extends Request {
  userId?: number;
}

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  try {
    const user = await validateTokenAndGetUser(authHeader);

    req.userId = user.id;
    return next();
  } catch (e) {
    const { message, statusCode } = e as RequestError;
    return res.status(statusCode).json({ message });
  }
};

export default authMiddleware;
