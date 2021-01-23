import { Response } from 'express';
import { getRepository } from 'typeorm';

import { encodeToken } from '@utils/auth';
import { RequestBody } from '@mytypes/request';
import { User } from '@entity/user';

interface Create {
  email: string;
  password: string;
}

type CreateRequest = RequestBody<Create>;

class LoginRestController {
  async create(req: CreateRequest, res: Response) {
    const { email, password } = req.body;

    const user = await getRepository(User).findOne({
      where: {
        email,
      },
    });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'email and/or password invalid(s)' });
    }

    return res.json({
      user,
      token: encodeToken(user),
    });
  }
}

export default new LoginRestController();

// [
//   userId: [
//     toUserId: [
//       {
//         id,
//         message,
//         date,
//       }
//     ]
//   ]
// ]
