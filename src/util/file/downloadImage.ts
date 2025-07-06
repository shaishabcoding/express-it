import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createDir } from '../../util/file/createDir';
import { logger } from '../logger/logger';
import colors from 'colors';
const imageDir = path.join(process.cwd(), 'uploads', 'images');

async function downloadImage(url: string) {
  logger.info(colors.green(`🔍 Downloading image from: ${url}`));
  try {
    createDir(imageDir);

    const fileName = `${uuidv4()}.png`;
    const destinationPath = path.join(imageDir, fileName);

    const response = await axios({
      url,
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(destinationPath);

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(true));
      writer.on('error', reject);
    });

    logger.info(
      colors.green(`✅ Image downloaded successfully: ${destinationPath}`),
    );

    return `/images/${fileName}`;
  } catch (error) {
    logger.error(colors.red('❎ Error downloading image:'), error);
  }
}

export default downloadImage;
