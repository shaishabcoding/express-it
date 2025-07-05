import { TUser } from './User.interface';

export const userSearchableFields: (keyof TUser)[] = [
  'name',
  'email',
  'phone',
  'gender',
  'role',
];
