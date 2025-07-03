import { z } from 'zod';
import { EUserGender } from './User.enum';
import { date } from '../../../util/transform/date';
import { lower } from '../../../util/transform/lower';

export const UserValidations = {
  create: z.object({
    body: z.object({
      email: z
        .string({
          required_error: 'Email is missing',
        })
        .email('Give a valid email'),
      password: z
        .string({
          required_error: 'Password is missing',
        })
        .min(6, 'Password must be at least 6 characters long'),
    }),
  }),

  edit: z.object({
    body: z.object({
      name: z.string().optional(),
      avatar: z.string().optional(),
      phone: z.string().optional(),
      gender: z
        .string()
        .transform(lower)
        .pipe(z.nativeEnum(EUserGender))
        .optional(),
      birthDate: z.string().transform(date).optional(),
    }),
  }),

  changePassword: z.object({
    body: z.object({
      oldPassword: z
        .string({
          required_error: 'Old Password is missing',
        })
        .min(1, 'Old Password is required')
        .min(6, 'Old Password must be at least 6 characters long'),
      newPassword: z
        .string({
          required_error: 'New Password is missing',
        })
        .min(1, 'New Password is required')
        .min(6, 'New Password must be at least 6 characters long'),
    }),
  }),

  list: z.object({
    query: z.object({
      search: z.string().trim().optional(),
    }),
  }),
};
