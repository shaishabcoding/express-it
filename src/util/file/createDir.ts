import fs from 'fs';

/**
 * Creates directories if they don't exist
 *
 * This function checks if directories exist at the specified paths.
 * If they don't exist, it creates them. It supports multiple paths.
 */
export const createDir = (...paths: string[]) => {
  paths.forEach(
    path => !fs.existsSync(path) && fs.mkdirSync(path, { recursive: true }),
  );
};
