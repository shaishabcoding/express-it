import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import catchAsync from '../../middlewares/catchAsync';
import User from './User.model';

export const UserMiddlewares = {
  useUser: (key = 'email') =>
    catchAsync(async (req, _, next) => {
      const user = await User.findOne({ [key]: req.body[key] });

      if (!user)
        next(
          new ServerError(
            StatusCodes.UNAUTHORIZED,
            'Your credentials are incorrect.',
          ),
        );
      else req.user = user;

      next();
    }),
};
