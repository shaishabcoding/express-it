/* eslint-disable no-unused-vars */
import { Socket } from 'socket.io';
import { verifyToken } from '../modules/auth/Auth.utils';
import User from '../modules/user/User.model';
import { json } from '../../util/transform/json';

const socketAuth = async (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.query?.token as string;

  if (!token) return next(new Error('Token not provided'));

  try {
    const { userId } = verifyToken(token, 'access_token');
    const user = await User.findById(userId).lean();

    if (!user) return next(new Error('User not found'));

    socket.data.user = json(JSON.stringify(user));

    socket.join(userId);
    next();
  } catch (error: any) {
    next(error);
  }
};

export default socketAuth;
