import { model, Schema } from 'mongoose';
import { TUser } from './User.interface';
import { UserMiddlewares } from './User.middleware';
import { EUserGender, EUserRole } from './User.enum';
import config from '../../../config';

const userSchema = new Schema<TUser>(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      type: String,
      default: config.server.default_avatar,
    },
    role: {
      type: String,
      enum: Object.values(EUserRole),
      default: EUserRole.USER,
    },
    phone: String,
    gender: {
      type: String,
      enum: Object.values(EUserGender),
    },
    birthDate: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.inject(UserMiddlewares.schema);

const User = model<TUser>('User', userSchema);

export default User;
