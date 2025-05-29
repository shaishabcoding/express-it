import { AuthServices } from './Auth.service';
import catchAsync from '../../../util/server/catchAsync';
import config from '../../../config';
import serveResponse from '../../../util/server/serveResponse';

export const AuthControllers = {
  login: catchAsync(async (req, res) => {
    const { accessToken, refreshToken, user } = await AuthServices.login(
      req.user!,
      req.body.password,
    );

    AuthServices.setRefreshToken(res, refreshToken);

    serveResponse(res, {
      message: 'Login successfully!',
      data: { token: accessToken, user },
    });
  }),

  logout: catchAsync(async (req, res) => {
    Object.keys(req.cookies).forEach(cookie =>
      res.clearCookie(cookie, {
        httpOnly: true,
        secure: !config.server.isDevelopment,
      }),
    );

    serveResponse(res, {
      message: 'Logged out successfully',
    });
  }),

  resetPassword: catchAsync(async ({ body, user }, res) => {
    await AuthServices.resetPassword(user as any, body.password);

    serveResponse(res, {
      message: 'Password reset successfully!',
    });
  }),

  refreshToken: catchAsync(async ({ cookies }, res) => {
    const { accessToken } = await AuthServices.refreshToken(
      cookies.refreshToken,
    );

    serveResponse(res, {
      message: 'AccessToken generated successfully!',
      data: { token: accessToken },
    });
  }),
};
