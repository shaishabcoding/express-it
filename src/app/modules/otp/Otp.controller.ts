import catchAsync from '../../../util/server/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { OtpServices } from './Otp.service';

export const OtpControllers = {
  send: catchAsync(async ({ body }, res) => {
    await OtpServices.send(body.email);

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

  list: catchAsync(async ({ query }, res) => {
    const { meta, otps } = await OtpServices.list(query);

    serveResponse(res, {
      message: 'OTPs retrieved successfully!',
      meta,
      data: otps,
    });
  }),
};
