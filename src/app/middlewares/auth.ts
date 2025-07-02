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
const auth = (roles: EUserRole[] = [], tokenType = ETokenType.ACCESS) =>
  catchAsync(async (req, _, next) => {
    const token =
      req.cookies[`${tokenType}_token`] ||
      req.headers.authorization?.split(/Bearer /i)?.[1];

    req.user = (await User.findById(
      verifyToken(token, tokenType).userId,
    ).select('+password')) as TUser;

    if (
      !req.user ||
      (roles[0] &&
        req.user.role !== EUserRole.ADMIN &&
        !roles.includes(req.user.role))
    )
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        `Permission denied. You are not ${roles.join(' or ')}!`,
      );

    next();
  });

auth.admin = () => auth([EUserRole.ADMIN]);
auth.reset = () => auth([], ETokenType.RESET);
auth.refresh = () => auth([], ETokenType.REFRESH);

export default auth;
