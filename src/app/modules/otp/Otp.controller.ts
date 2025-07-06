import catchAsync from '../../../util/server/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { createToken } from '../auth/Auth.utils';
import { EUserRole } from '../user/User.enum';
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

  verifyAccount: catchAsync(async ({ user, body }, res) => {
    if (user.role !== EUserRole.GUEST)
      return serveResponse(res, {
        message: 'You are already verified!',
      });

    await OtpServices.verify(user._id, body.otp);

    user.role = EUserRole.USER;
    await user.save();

    serveResponse(res, {
      message: 'Account verified successfully!',
      data: { user },
    });
  }),

  list: catchAsync(async ({ query }, res) => {
    const { meta, otps } = await OtpServices.list(query);

    serveResponse(res, {
      message: 'OTPs retrieved successfully!',
      meta,
      data: otps,
    });
  }),
};
