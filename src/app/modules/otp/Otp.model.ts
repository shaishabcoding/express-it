import { Schema, model } from 'mongoose';
import { TOtp } from './Otp.interface';

const otpSchema = new Schema<TOtp>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    exp: {
      type: Date,
      required: true,
    },
  },
  { versionKey: false },
);

// ! for auto delete after expire
otpSchema.index({ exp: 1 }, { expireAfterSeconds: 0 });

const Otp = model<TOtp>('Otp', otpSchema);

export default Otp;
