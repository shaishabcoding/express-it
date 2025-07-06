import { StatusCodes } from 'http-status-codes';
import config from '../../../config';
import ServerError from '../../../errors/ServerError';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { createToken } from '../auth/Auth.utils';
import { OtpServices } from './Otp.service';

export const OtpControllers = {
  resetPasswordOtpSend: catchAsync(async ({ user }, res) => {
    const otp = await OtpServices.send(user, 'resetPassword');

    serveResponse(res, {
      message: 'OTP sent successfully!',
      data: { expiredAt: otp?.exp?.toLocaleTimeString() },
    });
  }),

  resetPasswordOtpVerify: catchAsync(async ({ user, body }, res) => {
    await OtpServices.verify(user._id, body.otp);

    const resetToken = createToken({ userId: user._id }, 'reset_token');

    serveResponse(res, {
      message: 'OTP verified successfully!',
      data: { resetToken },
    });
  }),

  accountVerifyOtpSend: catchAsync(async ({ user }, res) => {
    const otp = await OtpServices.send(user, 'accountVerify');

    serveResponse(res, {
      message: 'OTP sent successfully!',
      data: { expiredAt: otp?.exp?.toLocaleTimeString() },
    });
  }),

  list: catchAsync(async ({ query }, res) => {
    //! only for development
    if (!config.server.isDevelopment)
      throw new ServerError(
        StatusCodes.UNAVAILABLE_FOR_LEGAL_REASONS,
        'Service not available.',
      );

    const { meta, otps } = await OtpServices.list(query);

    serveResponse(res, {
      message: 'OTPs retrieved successfully!',
      meta,
      data: otps,
    });
  }),
};
