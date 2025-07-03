import express from 'express';
import { AuthControllers } from './Auth.controller';
import { AuthValidations } from './Auth.validation';
import auth from '../../middlewares/auth';
import { UserControllers } from '../user/User.controller';
import { UserValidations } from '../user/User.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import { OtpRoutes } from '../otp/Otp.route';
import capture from '../../middlewares/capture';
import { UserMiddlewares } from '../user/User.middleware';

const router = express.Router();

router.post(
  '/register',
  capture({ avatar: { maxCount: 1, size: 5 * 1024 * 1024 } }),
  purifyRequest(UserValidations.create, UserValidations.edit),
  UserControllers.create,
);

router.post(
  '/login',
  purifyRequest(AuthValidations.login),
  UserMiddlewares.useUser(),
  AuthControllers.login,
);

router.post('/logout', AuthControllers.logout);

router.use('/otp', OtpRoutes.user);

router.post(
  '/reset-password',
  auth.reset(),
  purifyRequest(AuthValidations.resetPassword),
  AuthControllers.resetPassword,
);

/**
 * generate new access token
 */
router.get(
  '/refresh-token',
  purifyRequest(AuthValidations.refreshToken),
  AuthControllers.refreshToken,
);

export const AuthRoutes = router;
