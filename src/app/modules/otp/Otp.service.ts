import ms from 'ms';
import config from '../../../config';
import Otp from './Otp.model';
import { sendEmail } from '../../../util/sendMail';
import { OtpTemplates } from './Otp.template';
import User from '../user/User.model';
import { otpGenerator } from '../../../util/crypto/otpGenerator';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { TList } from '../query/Query.interface';
import { TOtp } from './Otp.interface';
import { TUser } from '../user/User.interface';

export const OtpServices = {
  async send(user: TUser, type: 'resetPassword' | 'accountVerify') {
    const otp = otpGenerator(config.otp.length);

    if (type === 'resetPassword')
      sendEmail({
        to: user.email,
        subject: `Your ${config.server.name} password reset OTP is ⚡ ${otp} ⚡.`,
        html: OtpTemplates.reset({
          userName: user?.name ?? 'Mr. ' + user.role,
          otp,
        }),
      });
    else if (type === 'accountVerify')
      sendEmail({
        to: user.email,
        subject: `Your ${config.server.name} account verification OTP is ⚡ ${otp} ⚡.`,
        html: OtpTemplates.welcome({
          userName: user?.name ?? 'Mr. ' + user.role,
          otp,
        }),
      });

    return Otp.findOneAndUpdate(
      { user: user._id },
      { otp, exp: new Date(Date.now() + ms(config.otp.exp)) },
      { upsert: true, new: true },
    );
  },

  async verify(userId: Types.ObjectId, otp: string) {
    const validOtp = await Otp.findOne({ user: userId, otp });

    if (!validOtp)
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'Your credentials are incorrect.',
      );

    return validOtp.deleteOne();
  },

  async list({ page, limit, email }: TList & { email: string }) {
    //! only for development
    if (!config.server.isDevelopment)
      throw new ServerError(
        StatusCodes.UNAVAILABLE_FOR_LEGAL_REASONS,
        'Service not available.',
      );

    const filter: Partial<TOtp> = {};

    if (email) {
      const user = await User.findOne({ email }).select('_id');

      if (!user)
        throw new ServerError(StatusCodes.NOT_FOUND, 'User not found!');

      filter.user = user._id;
    }

    const otps = await Otp.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name email avatar');

    const total = await Otp.countDocuments(filter);

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        query: {
          email,
        },
      },
      otps,
    };
  },
};
