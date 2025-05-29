import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import auth from '../../middlewares/auth';
import capture from '../../middlewares/capture';
import { UserValidations } from '../user/User.validation';
import { UserControllers } from '../user/User.controller';

const router = Router();

router.get('/', auth(), UserControllers.me);

router.patch(
  '/edit',
  capture({
    fields: [{ name: 'avatar', maxCount: 1, width: 300 }],
  }),
  purifyRequest(UserValidations.edit),
  UserControllers.edit,
);

router.patch(
  '/change-password',
  auth(),
  purifyRequest(UserValidations.cngPass),
  UserControllers.changePassword,
);

export const ProfileRoutes = router;
