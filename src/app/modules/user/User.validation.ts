import { z } from 'zod';
import { EUserGender, EUserRole } from './User.enum';
import { date } from '../../../util/transform/date';
import { lower } from '../../../util/transform/lower';

export const UserValidations = {
  createUser: z.object({
    body: z.object({
      name: z
        .string({
          required_error: 'Name is missing',
        })
        .min(1, 'Name is missing'),
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
      avatar: z
        .string({
          required_error: 'Upload an avatar',
        })
        .min(1, 'Upload an avatar'),
      phone: z
        .string({
          required_error: 'Phone number is missing',
        })
        .min(1, 'Phone number is missing'),
      gender: z.string().transform(lower).pipe(z.nativeEnum(EUserGender)),
      birthDate: z
        .string({
          required_error: 'Birth date is missing',
        })
        .transform(date),
      role: z.literal(EUserRole.USER).default(EUserRole.USER),
    }),
  }),

  createHost: z.object({
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
      role: z.literal(EUserRole.HOST).default(EUserRole.HOST),
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

  cngPass: z.object({
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
