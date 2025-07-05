import { Router } from 'express';
import { UserControllers } from './User.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { UserValidations } from './User.validation';
import User from './User.model';
import capture from '../../middlewares/capture';
import { AuthControllers } from '../auth/Auth.controller';

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

/** User Routes */

const user = Router();

user.get('/', UserControllers.me);

user.patch(
  '/edit',
  capture({
    avatar: {
      maxCount: 1,
      size: 5 * 1024 * 1024,
      default: null,
    },
  }),
  purifyRequest(UserValidations.edit),
  UserControllers.edit,
);

user.post(
  '/change-password',
  purifyRequest(UserValidations.changePassword),
  AuthControllers.changePassword,
);

export const UserRoutes = {
  admin,
  user,
};
