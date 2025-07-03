import { model, Schema } from 'mongoose';
import { TAuth } from './Auth.interface';

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

const Auth = model<TAuth>('Auth', authSchema);

export default Auth;
