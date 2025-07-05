import { Types } from 'mongoose';
import { EUserGender, EUserRole } from './User.enum';

export type TUser = {
  _id: Types.ObjectId;

  name?: string;
  email: string;
  avatar?: string;
  role: EUserRole;
  phone?: string;
  gender?: EUserGender;
  birthDate?: Date;

  createdAt?: Date;
  updatedAt?: Date;
};
