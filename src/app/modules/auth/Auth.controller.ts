import { AuthServices } from './Auth.service';
import catchAsync from '../../../util/server/catchAsync';
import config from '../../../config';
import serveResponse from '../../../util/server/serveResponse';

export const AuthControllers = {
  login: catchAsync(async ({ user, body }, res) => {
    const { access_token, refresh_token } = await AuthServices.login(
      user!._id!,
      body.password,
    );

    AuthServices.setTokens(res, { access_token, refresh_token });

    serveResponse(res, {
      message: 'Login successfully!',
      data: { access_token, user },
    });
  }),

  logout: catchAsync(async (req, res) => {
    Object.keys(req.cookies).forEach(cookie =>
      res.clearCookie(cookie, {
        httpOnly: true,
        secure: !config.server.isDevelopment,
        maxAge: 0, // expire immediately
      }),
    );

    serveResponse(res, {
      message: 'Logged out successfully!',
    });
  }),

  resetPassword: catchAsync(async ({ body, user }, res) => {
    await AuthServices.resetPassword(user as any, body.password);

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
