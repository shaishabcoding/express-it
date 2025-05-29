import nodemailer from 'nodemailer';
import config from '../config';
import { errorLogger, logger } from './logger/logger';
import { StatusCodes } from 'http-status-codes';
import ServerError from '../errors/ServerError';
import colors from 'colors';
const { host, port, user, pass, from } = config.email;

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: false,
  auth: {
    user,
    pass,
  },
});

/**
 * Send email
 * @param {TEmailProps} values - Email values
 * @returns void
 */
export const sendEmail = async (values: TEmailProps) => {
  logger.info(colors.yellow('Sending email...'), values);
  try {
    const { accepted } = await transporter.sendMail({
      from,
      ...values,
    });

    if (!accepted.length)
      throw new ServerError(StatusCodes.BAD_REQUEST, 'Mail not sent');

    logger.info(colors.green(`✔ Mail send successfully. On: ${accepted[0]}`));
  } catch (error: any) {
    errorLogger.error(colors.red('❌ Email send failed'), error.message);
    throw new ServerError(StatusCodes.BAD_REQUEST, error.message);
  }
};

type TEmailProps = {
  to: string;
  subject: string;
  html: string;
};
