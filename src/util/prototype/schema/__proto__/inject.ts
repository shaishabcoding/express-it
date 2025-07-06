/* eslint-disable no-unused-vars */
import { Schema } from 'mongoose';

declare module 'mongoose' {
  interface Schema {
    /**
     * Injects middleware functions into the schema
     * @param fn Function that receives the schema and applies middleware
     * @returns schema
     */
    inject(fn: (schema: Schema) => void): Schema;
  }
}

Schema.prototype.inject = function (fn) {
  fn(this);

  return this;
};

export {};
