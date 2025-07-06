/* eslint-disable no-unused-vars */
import { ClientSession, startSession } from 'mongoose';

export const useSession = async <T>(
  fn: (session: ClientSession) => Promise<T>,
): Promise<T> => {
  const session = await startSession();
  session.startTransaction();
  try {
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
