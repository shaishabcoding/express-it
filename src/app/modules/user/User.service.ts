import { TUser } from './User.interface';
import User from './User.model';
import { StatusCodes } from 'http-status-codes';
import deleteFile from '../../../util/file/deleteFile';
import ServerError from '../../../errors/ServerError';
import { userExcludeFields } from './User.constant';
import bcrypt from 'bcryptjs';
import { Document, Types } from 'mongoose';
import { TList } from '../query/Query.interface';

export const UserServices = {
  async create(user: TUser) {
    const hasUser = await User.exists({ email: user.email });

    if (hasUser)
      throw new ServerError(StatusCodes.CONFLICT, 'User already exists');

    return User.create(user);
  },

  async edit(user: TUser & { oldAvatar: string }) {
    const updatedUser = await User.findByIdAndUpdate(user!._id, user, {
      new: true,
    }).select('-' + userExcludeFields.join(' -'));

    if (user.avatar) await deleteFile(user.oldAvatar);

    return updatedUser;
  },

  async changePassword(
    user: TUser & Document,
    { newPassword, oldPassword }: Record<string, string>,
  ) {
    if (!(await bcrypt.compare(oldPassword, user.password!)))
      throw new ServerError(StatusCodes.UNAUTHORIZED, 'You are not authorized');

    user.password = newPassword;

    await user.save();
  },

  async list({ page, limit, search }: TList) {
    const filter: any = {};

    if (search)
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];

    const users = await User.find(filter)
      .select('-' + userExcludeFields.join(' -'))
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(filter);

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      users,
    };
  },

  async delete(userId: Types.ObjectId) {
    const user = await User.findByIdAndDelete(userId);

    if (user?.avatar) await deleteFile(user.avatar);

    return user;
  },
};
