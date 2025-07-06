/* eslint-disable no-console */
import { createClient, RedisClientType } from 'redis';

// Auto-connect decorator
function ensureConnected(
  _target: any,
  _key: string,
  descriptor: PropertyDescriptor,
) {
  const original = descriptor.value;
  descriptor.value = async function (this: RedisClient, ...args: any[]) {
    await this.connect();
    return original.apply(this, args);
  };
  return descriptor;
}

class RedisClient {
  private static instance: RedisClient;
  private client: RedisClientType;

  private constructor() {
    this.client = createClient({
      // url: config.url.redis,
    });
    this.client.on('error', console.error);
    this.client.on('connect', () => console.log('Redis client connected'));
    this.client.on('disconnect', () =>
      console.log('Redis client disconnected'),
    );
  }

  static getInstance() {
    return this.instance || (this.instance = new this());
  }

  public async connect() {
    if (!this.client.isOpen) await this.client.connect();
  }

  public async disconnect() {
    if (this.client.isOpen) await this.client.quit();
  }

  @ensureConnected
  async set(key: string, value: string, expiry = 3600) {
    await this.client.setEx(key, expiry, value);
  }

  @ensureConnected
  async get(key: string) {
    return this.client.get(key);
  }

  @ensureConnected
  async delete(key: string) {
    await this.client.del(key);
  }

  @ensureConnected
  async keys(pattern: string) {
    return this.client.keys(pattern);
  }
}

export const redisClient = RedisClient.getInstance();
