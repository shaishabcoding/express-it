import { Router } from 'express';
import { AuthControllers } from './Auth.controller';
import { AuthValidations } from './Auth.validation';
import auth from '../../middlewares/auth';
import { UserControllers } from '../user/User.controller';
import { UserValidations } from '../user/User.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import capture from '../../middlewares/capture';
import { UserMiddlewares } from '../user/User.middleware';
import { OtpValidations } from '../otp/Otp.validation';
import { OtpControllers } from '../otp/Otp.controller';
import { otpLimiter } from '../otp/Otp.utils';

const router = Router();

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

router.post(
  '/reset-password',
  auth.reset(),
  purifyRequest(AuthValidations.resetPassword),
  AuthControllers.resetPassword,
);

/**
 * generate new access token
 */
router.get('/refresh-token', auth.refresh(), AuthControllers.refreshToken);

/* Otps */
router.post(
  '/reset-password-otp-send',
  otpLimiter,
  purifyRequest(OtpValidations.send),
  UserMiddlewares.useUser(),
  OtpControllers.resetPasswordOtpSend,
);

router.post(
  '/reset-password-otp-verify',
  otpLimiter,
  purifyRequest(OtpValidations.verify),
  UserMiddlewares.useUser(),
  OtpControllers.resetPasswordOtpVerify,
);

router.post(
  '/account-verify',
  otpLimiter,
  purifyRequest(OtpValidations.verify),
  UserMiddlewares.useUser(),
  AuthControllers.verifyAccount,
);

export const AuthRoutes = router;
