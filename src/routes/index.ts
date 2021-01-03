import { Router } from 'express';

import authRoutes from './authRoutes';
import userRoutes from './userRoutes';

const routes = Router();

routes.use(userRoutes);
routes.use(authRoutes);

export default routes;
