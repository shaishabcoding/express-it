import { z } from 'zod';
import { upper } from '../../../util/transform/upper';
import config from '../../../config';

export const OtpValidations = {
  send: z.object({
    body: z.object({
      email: z
        .string({ required_error: 'Email is missing' })
        .email('Give a valid email'),
    }),
  }),

  verify: z.object({
    body: z.object({
      email: z
        .string({ required_error: 'Email is missing' })
        .email('Give a valid email'),
      otp: z
        .string({ required_error: 'OTP is missing' })
        .min(config.otp.length, 'Give a valid OTP')
        .transform(upper),
    }),
  }),

  list: z.object({
    query: z.object({
      email: z.string().email('Give a valid email').optional(),
    }),
  }),
};
