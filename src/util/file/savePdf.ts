import fs from 'fs/promises';
import path from 'path';
import { createDir } from './createDir';

const pdfDir = path.join(process.cwd(), 'uploads', 'pdf');

export const savePdf = async (
  buffer: Buffer,
  filename: string,
): Promise<string> => {
  createDir(pdfDir);

  const filePath = path.join(pdfDir, filename);
  await fs.writeFile(filePath, buffer);

  return `/uploads/pdf/${filename}`;
};
