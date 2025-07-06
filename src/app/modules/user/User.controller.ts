import { UserServices } from './User.service';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { StatusCodes } from 'http-status-codes';
import { AuthServices } from '../auth/Auth.service';
import { OtpServices } from '../otp/Otp.service';
import { errorLogger } from '../../../util/logger/logger';

export const UserControllers = {
  create: catchAsync(async ({ body }, res) => {
    const user = await UserServices.create(body);

    try {
      await OtpServices.send(user, 'accountVerify');
    } catch (error) {
      errorLogger.error(error);
    }

    const { access_token, refresh_token } = await AuthServices.retrieveToken(
      user._id!,
    );

    AuthServices.setTokens(res, { access_token, refresh_token });

    serveResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: `${user.role.toCapitalize() ?? 'User'} registered successfully!`,
      data: {
        access_token,
        user,
      },
    });
  }),

  edit: catchAsync(async (req, res) => {
    const data = await UserServices.edit(req);

    serveResponse(res, {
      message: 'Profile updated successfully!',
      data,
    });
  }),

  list: catchAsync(async (req, res) => {
    const { meta, users } = await UserServices.list(req.query);

    serveResponse(res, {
      message: 'Users retrieved successfully!',
      meta,
      data: users,
    });
  }),

  me: catchAsync(({ user }, res) => {
    serveResponse(res, {
      message: 'Profile retrieved successfully!',
      data: user,
    });
  }),

  delete: catchAsync(async ({ params }, res) => {
    const user = await UserServices.delete(params.userId);

    serveResponse(res, {
      message: `${user?.name ?? 'User'} deleted successfully!`,
    });
  }),
};
