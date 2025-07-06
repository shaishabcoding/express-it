import { Router } from 'express';
import { UserRoutes } from '../user/User.route';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { OtpValidations } from '../otp/Otp.validation';
import { OtpControllers } from '../otp/Otp.controller';
import config from '../../../config';

const adminRoutes = Router().inject([
  {
    path: '/users',
    route: UserRoutes.admin,
  },
]);

//! only for development
if (config.server.isDevelopment)
  adminRoutes.get(
    '/otps',
    purifyRequest(QueryValidations.list, OtpValidations.list),
    OtpControllers.list,
  );

export default adminRoutes;
