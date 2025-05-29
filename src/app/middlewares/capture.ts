/* eslint-disable no-undef */
import path from 'path';
import multer, { FileFilterCallback, Field, memoryStorage } from 'multer';
import { StatusCodes } from 'http-status-codes';
import ServerError from '../../errors/ServerError';
import { createDir } from '../../util/file/createDir';
import catchAsync from '../../util/server/catchAsync';
import sharp from 'sharp';
import { json } from '../../util/transform/json';

interface CaptureField extends Field {
  width?: number;
  height?: number;
}

interface CaptureOptions {
  fields?: CaptureField[];
  maxFileSizeMB?: number;
}

/**
 * Smart image upload handler with per-field processing
 * @example capture({ fields: [{ name: 'avatar', width: 200 }] })
 */
const capture = ({
  fields = [{ name: 'images', maxCount: 10 }],
  maxFileSizeMB = 5,
}: CaptureOptions = {}) => {
  const uploadDir = path.join(process.cwd(), 'uploads', 'images');
  createDir(uploadDir);

  const storage = memoryStorage();

  const fileFilter = (_req: any, file: any, cb: FileFilterCallback) => {
    if (
      !file.originalname.match(
        /\.(jpg|jpeg|png|gif|bmp|tiff|tif|svg|ico|webp|avif|cur|pcx)$/,
      ) ||
      !file.mimetype.startsWith('image/')
    )
      return cb(
        new ServerError(
          StatusCodes.BAD_REQUEST,
          `\`${file.originalname}\` is not an image. mimetype: ${file.mimetype}`,
        ),
      );

    cb(null, true);
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSizeMB * 1024 * 1024,
    },
  }).fields(fields);

  return catchAsync(async (req, res, next) => {
    upload(req, res, async err => {
      if (err) return next(err);

      const uploadedFiles = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };
      const images: { [fieldname: string]: string | string[] } = {};
      req.tempFiles = [];

      try {
        await Promise.all(
          fields.map(async field => {
            const files = uploadedFiles?.[field.name];
            if (!files?.length) return;

            const processed = await Promise.all(
              files.map(async file => {
                const fileExt = path.extname(file.originalname);
                const fileName = `${file.originalname
                  .replace(fileExt, '')
                  .toLowerCase()
                  .split(' ')
                  .join('-')}-${Date.now()}.jpeg`;

                const filePath = path.join(uploadDir, fileName);

                const processor = sharp(file.buffer)
                  .rotate()
                  .withMetadata()
                  .toFormat('jpeg', { quality: 80 });

                if (field.width || field.height)
                  processor.resize(field.width, field.height, {
                    fit: 'inside',
                  });

                await processor.toFile(filePath);
                req.tempFiles.push(`/images/${fileName}`);
                return `/images/${fileName}`;
              }),
            );

            images[field.name] =
              field.maxCount && field.maxCount > 1 ? processed : processed[0];
          }),
        );

        Object.assign(req.body, json(req.body.data) ?? {}, images);

        next();
      } catch (error) {
        next(
          new ServerError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Image processing failed',
          ),
        );
      }
    });
  });
};

export default capture;
