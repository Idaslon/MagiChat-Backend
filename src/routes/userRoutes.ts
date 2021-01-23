import { Router } from 'express';

import UserRestController from '@controllers/User/rest';
import LoginRestController from '@controllers/Login/rest';

const userRoutes = Router();

userRoutes.get('/', async (req, res) => {
  return res.json({ message: 'Hey there!' });
});

userRoutes.post('/login', LoginRestController.create);

userRoutes.get('/users', UserRestController.index);
userRoutes.post('/users', UserRestController.create);

export default userRoutes;
