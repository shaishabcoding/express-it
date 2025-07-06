import colors from 'colors';
import { errorLogger } from '../../../util/logger/logger';
import User from '../user/User.model';
import { logger } from '../../../util/logger/logger';
import { useSession } from '../../../util/db/session';
import Auth from '../auth/Auth.model';
import config from '../../../config';
import { EUserRole } from '../user/User.enum';

export const AdminServices = {
  /**
   * Seeds the admin user if it doesn't exist in the database
   *
   * This function checks if an admin user already exists in the database.
   * If an admin user exists, it returns without creating a new one.
   * Otherwise, it creates a new admin user with the provided admin data.
   */
  async seed() {
    const adminData = config.admin;
    try {
      return useSession(async session => {
        let admin = await User.exists({
          email: adminData.email,
        }).session(session);

        if (admin) return;

        logger.info(colors.green('🔑 admin creation started...'));

        [admin] = await User.create([{ ...adminData, role: EUserRole.ADMIN }], {
          session,
        });
        await Auth.create(
          [
            {
              user: admin._id,
              password: adminData.password,
            },
          ],
          { session },
        );

        logger.info(colors.green('✔ admin created successfully!'));
      });
    } catch (error) {
      errorLogger.error(colors.red('❌ admin creation failed!'), error);
    }
  },
};
