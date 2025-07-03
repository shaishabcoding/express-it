/* eslint-disable no-unused-vars */
import { TUser } from './User.interface';
import User from './User.model';
import { StatusCodes } from 'http-status-codes';
import deleteFile from '../../../util/file/deleteFile';
import ServerError from '../../../errors/ServerError';
import { userExcludeFields } from './User.constant';
import { Types } from 'mongoose';
import { TList } from '../query/Query.interface';
import Auth from '../auth/Auth.model';
import { TAuth } from '../auth/Auth.interface';
import { useSession } from '../../../util/db/session';

export const UserServices = {
  async create(userData: TUser & TAuth) {
    return useSession(async session => {
      const hasUser = await User.exists({ email: userData.email }).session(
        session,
      );

      if (hasUser)
        throw new ServerError(StatusCodes.CONFLICT, 'User already exists');

      const [user] = await User.create([userData], { session });

      await Auth.create(
        [
          {
            user: user._id,
            password: userData.password,
          },
        ],
        { session },
      );

      return user;
    });
  },

  async edit(user: TUser & { oldAvatar: string }) {
    const updatedUser = await User.findByIdAndUpdate(user!._id, user, {
      new: true,
    }).select('-' + userExcludeFields.join(' -'));

    if (user.avatar) await deleteFile(user.oldAvatar);

    return updatedUser;
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
