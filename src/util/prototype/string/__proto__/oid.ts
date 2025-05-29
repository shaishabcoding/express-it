import { Types } from 'mongoose';
import ServerError from '../../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';

declare global {
  interface String {
    readonly oid: Types.ObjectId;
  }
}

Object.defineProperty(String.prototype, 'oid', {
  get() {
    if (!this.trim()) return;

    if (!Types.ObjectId.isValid(this as string))
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        this + ' is an invalid ObjectId',
      );

    return new Types.ObjectId(this as string);
  },
  enumerable: false,
});

export {};
