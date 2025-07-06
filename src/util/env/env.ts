/* eslint-disable no-console */
import fs from 'fs';
import { envPath } from '../../config/configure';
import colors from 'colors';

/**
 * Retrieves an environment variable with type checking, error handling, and appending to .env if not found
 *
 * @param key - The key of the environment variable to retrieve
 * @param defaultValue - The default value to return if the environment variable is not found
 * @returns The value of the environment variable or the default value
 */
export default function env<T>(
  key: string,
  defaultValue?: T,
  level: string | null = null,
  start = true,
): T {
  key = key.toSnakeCase().toUpperCase();
  let value: any = process.env[key];

  if (value === undefined) {
    console.log(
      colors.yellow(
        `⚠️ Environment variable ${key} is not set, setting to ${defaultValue}`,
      ),
    );

    if (defaultValue === undefined)
      console.error(colors.red(`❌ Environment variable ${key} is required`));

    if (fs.existsSync(envPath)) {
      const envData = fs.readFileSync(envPath, 'utf8');

      const keyRegex = new RegExp(`^${key} =`, 'm');

      if (!keyRegex.test(envData))
        fs.appendFileSync(
          envPath,
          `${level && start ? `# ${level}\n` : ''}${key} = "${defaultValue}"${level && !start ? `\n# ${level}\n\n` : ''}\n`,
          'utf8',
        );
    } else
      fs.writeFileSync(
        envPath,
        `${level ? `# ${level}\n` : ''}${key} = "${defaultValue}"\n`,
        'utf8',
      );

    console.log(
      colors.green(`✅ Environment variable ${key} set to ${defaultValue}`),
    );

    if (Array.isArray(defaultValue)) value = defaultValue.join(',');
    else value = defaultValue;
  }

  if (typeof defaultValue === 'boolean')
    return (value!.toLowerCase() === 'true') as T;

  if (typeof defaultValue === 'number') {
    const num = Number(value);
    if (isNaN(num))
      throw new Error(`Environment variable ${key} is not a valid number`);

    return num as T;
  }

  if (Array.isArray(defaultValue))
    return value!.split(',').map((item: string) => item.trim()) as T;

  return (value ?? defaultValue) as T;
}
