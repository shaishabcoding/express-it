import type { Express } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GridFsStorage } from 'multer-gridfs-storage';
import multer, { FileFilterCallback } from 'multer';
import ServerError from '../../errors/ServerError';
import catchAsync from './catchAsync';
import config from '../../config';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { errorLogger, logger } from '../../util/logger/logger';
import colors from 'colors';
import { json } from '../../util/transform/json';

let bucket: GridFSBucket | null = null;

mongoose.connection.on('connected', () => {
  bucket ??= new GridFSBucket(mongoose.connection.db as any, {
    bucketName: 'images',
  });
});

/**
 * @description Multer middleware to handle image uploads to MongoDB GridFS
 */
const capture = (fields: {
  [field: string]: {
    default?: string | string[] | null;
    maxCount?: number;
    size?: number;
  };
}) =>
  catchAsync(async (req, res, next) => {
    req.tempFiles ??= [];

    Object.keys(fields).forEach(field => {
      fields[field].maxCount ??= 5;
      fields[field].size ??= 5;
      if (fields[field].default === undefined)
        fields[field].default = config.server.default_avatar;
      else if (
        Array.isArray(fields[field].default) &&
        fields[field].default[0] === undefined
      )
        fields[field].default = [config.server.default_avatar];
    });

    try {
      await new Promise<void>((resolve, reject) =>
        upload(fields)(req, res, err => (err ? reject(err) : resolve())),
      );

      const files = req.files as { [field: string]: Express.Multer.File[] };

      Object.keys(fields).forEach(field => {
        if (files?.[field]?.length) {
          const images = files[field].map(
            ({ filename }) => `/images/${filename}`,
          );

          req.body[field] = Array.isArray(fields[field].default)
            ? images
            : images[0];

          //! for cleanup
          req.tempFiles.push(...images);
        }
      });
    } catch (error) {
      errorLogger.error(error);

      Object.keys(fields).forEach(field => {
        req.body[field] = fields[field].default;
      });
    } finally {
      if (req.body?.data) {
        Object.assign(req.body, json(req.body.data));
        delete req.body.data;
      }

      next();
    }
  });

export default capture;

/**
 * @description Retrieves an image from MongoDB GridFS
 */
export const imageRetriever = catchAsync(async (req, res) => {
  if (!bucket)
    throw new ServerError(
      StatusCodes.SERVICE_UNAVAILABLE,
      'Images not available',
    );

  let filename = req.params.filename.replace(/[^\w.-]/g, '');
  const shouldRedirect = !/\.png$/i.test(filename);

  if (shouldRedirect) filename = `${filename.replace(/\.[a-zA-Z]+$/, '')}.png`;

  const fileExists = await bucket.find({ filename }).hasNext();
  if (!fileExists)
    throw new ServerError(StatusCodes.NOT_FOUND, 'Image not found');

  if (shouldRedirect)
    return res.redirect(
      StatusCodes.MOVED_PERMANENTLY,
      `/images/${encodeURIComponent(filename)}`,
    );

  return new Promise((resolve, reject) => {
    res.set('Content-Type', 'image/png');
    const stream = bucket!
      .openDownloadStreamByName(filename)
      .on('error', () =>
        reject(new ServerError(StatusCodes.NOT_FOUND, 'Stream error')),
      )
      .pipe(res)
      .on('finish', resolve);

    res.on('close', () => stream.destroy());
  });
});

/**
 * @description Deletes an image from MongoDB GridFS
 */
export const deleteImage = async (filename: string) => {
  filename = filename.replace(/^\/images\//, '');

  try {
    if (!bucket) return;

    logger.info(colors.yellow(`🗑️ Deleting image: '${filename}'`));

    const result = await Promise.all(
      (
        await bucket
          .find({ filename: filename.replace(/^\/images\//, '') })
          .toArray()
      )?.map(({ _id }) => bucket!.delete(_id)),
    );

    if (result)
      logger.info(colors.green(`✔ image '${filename}' deleted successfully!`));
    else logger.info(colors.red(`❌ image '${filename}' not deleted!`));

    return result;
  } catch (error: any) {
    errorLogger.error(
      colors.red(`❌ image '${filename}' not deleted!`),
      error?.stack ?? error,
    );
  }
};

const storage = new GridFsStorage({
  url: config.url.database,
  file: (req, { originalname }) => ({
    filename: `${originalname
      .replace(/\..+$/, '')
      .replace(/[^\w]+/g, '-')
      .toLowerCase()}-${Date.now()}.png`,
    bucketName: 'images',
    metadata: {
      uploadedBy: req?.user?._id ?? null,
      originalName: originalname,
    },
  }),
});

const fileFilter = (
  _: any,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (
    /^image\/.+/i.test(file.mimetype) ||
    /\.(jpe?g|png|gif|webp|avif|svg|bmp|tiff?)$/i.test(file.originalname)
  )
    return cb(null, true);
  cb(
    new ServerError(
      StatusCodes.BAD_REQUEST,
      `${file.originalname} is not a valid image file`,
    ),
  );
};

const upload = (fields: {
  [field: string]: {
    default?: string | string[] | null;
    maxCount?: number;
    size?: number;
  };
}) =>
  multer({ storage, fileFilter }).fields(
    Object.keys(fields).map(field => ({
      name: field,
      maxCount: fields[field].maxCount || undefined,
      size: (fields[field].size || 5) * 1024 * 1024,
    })),
  );
