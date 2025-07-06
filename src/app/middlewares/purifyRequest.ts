/* eslint-disable no-console */
import { AnyZodObject } from 'zod';
import catchAsync from './catchAsync';
import config from '../../config';

const keys = ['body', 'query', 'params', 'cookies'] as const;

/**
 * Middleware to purify and validate the request {body, cookies, query, params} using multiple Zod schemas.
 *
 * This middleware validates the request against all provided Zod schemas.
 * The validated and merged data is then assigned back to `req`.
 * If validation fails, an error is thrown and handled by `catchAsync`.
 *
 * @param {...AnyZodObject} schemas - The Zod schemas to validate the request against.
 * @return Middleware function to purify the request.
 */
const purifyRequest = (...schemas: AnyZodObject[]) =>
  catchAsync(
    async (req, _, next) => {
      const results = await Promise.all(
        schemas.map(schema => schema.parseAsync(req)),
      );

      keys.forEach(key => {
        req[key] = Object.assign(
          {},
          key === 'params' && req.params,
          ...results.map(result => result?.[key] ?? {}),
        );
      });

      next();
    },
    (error, req, _, next) => {
      if (config.server.isDevelopment)
        keys.forEach(key => console.log(`${key} :`, req[key]));

      next(error);
    },
  );

export default purifyRequest;
