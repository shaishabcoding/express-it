import { StatusCodes } from 'http-status-codes';
import ServerError from '../../errors/ServerError';
import catchAsync from '../../util/server/catchAsync';
import User from '../modules/user/User.model';

export const temUser = (select = '_id', key = 'email') =>
  catchAsync(async (req, _, next) => {
    const user = await User.findOne({ [key]: req.body[key] }).select(select);

    if (!user)
      next(new ServerError(StatusCodes.UNAUTHORIZED, 'You are not authorized'));
    else req.user = user;

    next();
  });
