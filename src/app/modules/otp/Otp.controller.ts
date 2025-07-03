import catchAsync from '../../../util/server/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { OtpServices } from './Otp.service';

export const OtpControllers = {
  send: catchAsync(async ({ user }, res) => {
    await OtpServices.send(user!, 'resetPassword');

    serveResponse(res, {
      message: 'OTP sent successfully!',
    });
  }),

  verify: catchAsync(async (req, res) => {
    const resetToken = await OtpServices.verify(req.user!._id!, req.body.otp);

    serveResponse(res, {
      message: 'OTP verified successfully!',
      data: { resetToken },
    });
  }),

  verifyAccount: catchAsync(async ({ user, body }, res) => {
    await OtpServices.verifyAccount(user as any, body.otp);

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
