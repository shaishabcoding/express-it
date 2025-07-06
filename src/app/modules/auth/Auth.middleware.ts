import { Schema } from 'mongoose';
import { TAuth } from './Auth.interface';
import { hashPassword } from './Auth.utils';

export const AuthMiddlewares = {
  schema: (schema: Schema<TAuth>) => {
    schema.pre('save', async function (next) {
      try {
        if (this.isModified('password'))
          this.password = await hashPassword(this.password);
      } finally {
        next();
      }
    });
  },
};
