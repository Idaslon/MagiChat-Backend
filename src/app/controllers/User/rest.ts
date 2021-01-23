import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { User } from '@entity/user';
import { RequestBody } from '@mytypes/request';

interface Create {
  name: string;
  email: string;
  password: string;
}

type CreateRequest = RequestBody<Create>;

class UserRestController {
  async index(req: Request, res: Response) {
    const users = await getRepository(User).find();

    return res.json(users);
  }

  async create(req: CreateRequest, res: Response) {
    const { name, email, password } = req.body;

    const userData = getRepository(User).create({
      name,
      email,
      password,
    });

    try {
      const user = await getRepository(User).save(userData);

      return res.json(user);
    } catch (e) {
      return res.status(400).json({ message: 'Error creating user' });
    }
  }
}

export default new UserRestController();
