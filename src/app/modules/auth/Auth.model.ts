import { model, Schema } from 'mongoose';
import { TAuth } from './Auth.interface';
import { AuthMiddlewares } from './Auth.middleware';

const authSchema = new Schema<TAuth>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  password: {
    type: String,
  },
});

AuthMiddlewares.schema(authSchema);

const Auth = model<TAuth>('Auth', authSchema);

export default Auth;
