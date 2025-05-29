import config from '../../../config';
import { EUserGender, EUserRole } from '../user/User.enum';
import { TUser } from '../user/User.interface';

export const adminData: TUser = {
  ...config.admin,
  role: EUserRole.ADMIN,
  avatar: config.server.default_avatar,
  birthDate: new Date(),
  gender: EUserGender.MALE,
  phone: '1234567890',
};
