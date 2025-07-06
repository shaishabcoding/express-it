/* eslint-disable no-unused-vars */
import pdf, { CreateOptions } from 'html-pdf';

declare global {
  interface String {
    /**
     * Converts a string (HTML) to a PDF buffer using html-pdf.
     * @returns {Promise<Buffer>}
     */
    toPdf(options?: CreateOptions): Promise<Buffer>;
  }
}

Object.defineProperties(String.prototype, {
  toPdf: {
    value: function (
      options: CreateOptions = { format: 'A4', border: '10mm' },
    ): Promise<Buffer> {
      return new Promise((resolve, reject) => {
        pdf.create(this.toString(), options).toBuffer((err, buffer) => {
          if (err) {
            reject(err);
          } else {
            resolve(buffer);
          }
        });
      });
    },
  },
});

export {};
