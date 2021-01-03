import { Router } from 'express';

import UserController from '@controllers/UserController';
import LoginController from '@controllers/LoginController';

const userRoutes = Router();

userRoutes.get('/', async (req, res) => {
  return res.json({ message: 'Hey there!' });
});

userRoutes.post('/login', LoginController.create);

userRoutes.get('/users', UserController.index);
userRoutes.post('/users', UserController.create);

export default userRoutes;
