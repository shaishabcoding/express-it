import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import auth from '../../middlewares/auth';
import { UserValidations } from '../user/User.validation';
import { UserControllers } from '../user/User.controller';
import capture from '../../middlewares/capture';

const router = Router();

router.get('/', auth(), UserControllers.me);

router.patch(
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

router.patch(
  '/change-password',
  auth(),
  purifyRequest(UserValidations.cngPass),
  UserControllers.changePassword,
);

export const ProfileRoutes = router;
