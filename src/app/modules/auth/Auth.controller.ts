import { AuthServices } from './Auth.service';
import catchAsync from '../../../util/server/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { TToken } from './Auth.interface';

export const AuthControllers = {
  login: catchAsync(async ({ user, body }, res) => {
    const { access_token, refresh_token } = await AuthServices.login(
      user._id,
      body.password,
    );

    AuthServices.setTokens(res, { access_token, refresh_token });

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
    await AuthServices.resetPassword(user as any, body.password);

    AuthServices.destroyTokens(res, ['reset_token']);

    serveResponse(res, {
      message: 'Password reset successfully!',
    });
  }),

  refreshToken: catchAsync(async ({ cookies }, res) => {
    const { access_token } = await AuthServices.refreshToken(
      cookies.refreshToken,
    );

    serveResponse(res, {
      message: 'AccessToken generated successfully!',
      data: { access_token },
    });
  }),

  changePassword: catchAsync(async ({ user, body }, res) => {
    await AuthServices.changePassword(user as any, body);

    serveResponse(res, {
      message: 'Password changed successfully!',
    });
  }),
};
