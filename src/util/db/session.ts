/* eslint-disable no-unused-vars */
import { ClientSession, startSession } from 'mongoose';
import User from '../../app/modules/user/User.model';
import { logger } from '../logger/logger';
import colors from 'colors';

let supportSession: boolean | null = null;

/**
 * Runs a function inside a MongoDB session and transaction if supported.
 *
 * Checks once if the database supports sessions by running a test query in a transaction.
 * If supported, runs `fn` with a session and transaction.
 * If not supported, runs `fn` without a session.
 */
export const useSession = async <T>(
  fn: (session: ClientSession | null) => Promise<T>,
): Promise<T> => {
  if (supportSession === null) {
    const session = await startSession();
    session.startTransaction();
    try {
      await User.exists({}).session(session);
      await session.commitTransaction();
      supportSession = true;
    } catch (error) {
      await session.abortTransaction();
      supportSession = false;
    } finally {
      session.endSession();
      logger.info(
        colors.yellow(
          `Database ${supportSession ? 'supports' : 'does not support'} sessions`,
        ),
      );
    }
  }

  if (supportSession === false) return fn(null);

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
