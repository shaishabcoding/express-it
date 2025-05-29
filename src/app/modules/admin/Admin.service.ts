import colors from 'colors';
import { errorLogger } from '../../../util/logger/logger';
import User from '../user/User.model';
import { logger } from '../../../util/logger/logger';
import { adminData } from './Admin.constant';

export const AdminServices = {
  /**
   * Seeds the admin user if it doesn't exist in the database
   *
   * This function checks if an admin user already exists in the database.
   * If an admin user exists, it returns without creating a new one.
   * Otherwise, it creates a new admin user with the provided admin data.
   */
  async seed() {
    try {
      const hasAdmin = await User.exists({
        email: adminData.email,
      });

      if (hasAdmin) return;

      logger.info(colors.green('🔑 admin creation started...'));

      await User.create(adminData);

      logger.info(colors.green('✔ admin created successfully!'));
    } catch (error) {
      errorLogger.error(colors.red('❌ admin creation failed!'), error);
    }
  },
};
