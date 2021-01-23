import { Router } from 'express';

import UserRestController from '@controllers/UserController/rest';
import LoginRestController from '@controllers/LoginController/rest';

const userRoutes = Router();

userRoutes.get('/', async (req, res) => {
  return res.json({ message: 'Hey there!' });
});

userRoutes.post('/login', LoginRestController.create);

userRoutes.get('/users', UserRestController.index);
userRoutes.post('/users', UserRestController.create);

export default userRoutes;
