import { Router } from 'express';
import { UserControllers } from './User.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { TRoute } from '../../../types/route.types';
import { ProfileRoutes } from '../profile/Profile.route';
import { ChatRoutes } from '../chat/Chat.route';
import { UserValidations } from './User.validation';
import User from './User.model';

/** User Routes */
const userRoutes: TRoute[] = [
  {
    path: '/profile',
    route: ProfileRoutes,
  },
  {
    path: '/chats',
    route: ChatRoutes,
  },
];

/** Admin Routes */
const admin = Router();

admin.get(
  '/',
  purifyRequest(QueryValidations.list, UserValidations.list),
  UserControllers.list,
);

admin.delete(
  '/:userId/delete',
  purifyRequest(QueryValidations.exists('userId', User)),
  UserControllers.delete,
);

export const UserRoutes = {
  admin,
  user: Router().inject(userRoutes),
};
