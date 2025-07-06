import cors from 'cors';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import RoutesV1 from './routes/v1';
import { Morgan } from './util/logger/morgen';
import cookieParser from 'cookie-parser';
import ServerError from './errors/ServerError';
import config from './config';
import { imageRetriever } from './app/middlewares/capture';

/**
 * The main application instance
 *
 * This is the main application instance that sets up the Express server.
 * It configures middleware, routes, and error handling.
 */
const app = express();

// Serve static files
app.use(express.static('public'));
app.get('/images/:filename', imageRetriever);

// Configure middleware
app.use(
  cors({
    origin: config.server.allowed_origins,
    credentials: true,
  }),

  Morgan.successHandler,
  Morgan.errorHandler,

  (req, res, next) =>
    (req.headers['stripe-signature']
      ? express.raw({ type: 'application/json' })
      : express.json())(req, res, next),

  express.text(),
  express.urlencoded({ extended: true }),
  cookieParser(),
);

// Health check endpoint
app.get('/', (_, res) => {
  res.send(`
    ${config.server.name} is running successfully.
    Please check the <a href="${config.url.api_doc}">documentation</a> for more details.
  `);
});

// API routes
app.use('/api/v1', RoutesV1);

// 404 handler
app.use(({ originalUrl }, _, next) => {
  next(
    new ServerError(StatusCodes.NOT_FOUND, `Route not found. ${originalUrl}`),
  );
});

// Error handler
app.use(globalErrorHandler);

export default app;
