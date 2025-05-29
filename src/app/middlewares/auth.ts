import { StatusCodes } from 'http-status-codes';
import ServerError from '../../errors/ServerError';
import User from '../modules/user/User.model';
import { verifyToken } from '../modules/auth/Auth.utils';
import catchAsync from '../../util/server/catchAsync';
import { EUserRole } from '../modules/user/User.enum';
import { TUser } from '../modules/user/User.interface';
import { ETokenType } from '../modules/auth/Auth.enum';

/**
 * Middleware to authenticate and authorize requests based on user roles
 *
 * @param roles - The roles that are allowed to access the resource
 */
const auth = (
  roles: EUserRole[] = [],
  tokenType: ETokenType = ETokenType.ACCESS,
) =>
  catchAsync(async (req, _, next) => {
    req.user = (await User.findById(
      verifyToken(req.headers.authorization?.split(' ')?.[1] ?? '', tokenType)
        .userId,
    ).select('+password')) as TUser;

    if (
      !req.user ||
      (roles[0] &&
        req.user.role !== EUserRole.ADMIN &&
        !roles.includes(req.user.role))
    )
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        'Sorry, you cannot access this resource!',
      );

    next();
  });

auth.admin = auth.bind(null, [EUserRole.ADMIN]);
auth.host = auth.bind(null, [EUserRole.HOST]);
auth.reset = auth.bind(null, [], ETokenType.RESET);

export default auth;
