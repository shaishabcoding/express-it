import { AuthServices } from './Auth.service';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { TToken } from './Auth.interface';
import { EUserRole } from '../user/User.enum';
import { OtpServices } from '../otp/Otp.service';

export const AuthControllers = {
  login: catchAsync(async ({ user, body }, res) => {
    await AuthServices.getAuth(user._id, body.password);

    const { access_token, refresh_token } = await AuthServices.retrieveToken(
      user._id,
    );

    AuthServices.setTokens(res, {
      access_token,
      refresh_token,
    });

    serveResponse(res, {
      message: 'Login successfully!',
      data: { access_token, user },
    });
  }),

  logout: catchAsync(async ({ cookies }, res) => {
    AuthServices.destroyTokens(res, Object.keys(cookies) as TToken[]);

    serveResponse(res, {
      message: 'Logged out successfully!',
    });
  }),

  resetPassword: catchAsync(async ({ body, user }, res) => {
    await AuthServices.resetPassword(user._id, body.password);

    const { access_token, refresh_token } = await AuthServices.retrieveToken(
      user._id,
    );

    AuthServices.destroyTokens(res, ['reset_token']);
    AuthServices.setTokens(res, { access_token, refresh_token });

    serveResponse(res, {
      message: 'Password reset successfully!',
      data: { access_token, user },
    });
  }),

  refreshToken: catchAsync(async ({ user }, res) => {
    const { access_token } = await AuthServices.retrieveToken(user._id);

    AuthServices.setTokens(res, { access_token });

    serveResponse(res, {
      message: 'AccessToken refreshed successfully!',
      data: { access_token },
    });
  }),

  changePassword: catchAsync(async ({ user, body }, res) => {
    const auth = await AuthServices.getAuth(user._id, body.oldPassword);

    auth.password = body.newPassword;

    await auth.save();

    serveResponse(res, {
      message: 'Password changed successfully!',
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
};
