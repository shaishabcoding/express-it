import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { OtpValidations } from './Otp.validation';
import { otpLimiter } from './Otp.utils';
import { OtpControllers } from './Otp.controller';
import config from '../../../config';
import { QueryValidations } from '../query/Query.validation';
import { UserMiddlewares } from '../user/User.middleware';

/** User routes */
const user = Router();

user.post(
  '/send',
  otpLimiter,
  purifyRequest(OtpValidations.send),
  OtpControllers.send,
);

user.post(
  '/verify',
  purifyRequest(OtpValidations.verify),
  UserMiddlewares.useUser(),
  OtpControllers.verify,
);

/** Admin routes */
const admin = Router();

//! only for development
if (config.server.isDevelopment)
  admin.get(
    '/',
    purifyRequest(QueryValidations.list, OtpValidations.list),
    OtpControllers.list,
  );

export const OtpRoutes = {
  user,
  admin,
};
