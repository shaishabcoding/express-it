import './configure';
import env from '../util/env/env';
import type ms from 'ms';
import { genSecret } from '../util/crypto/genSecret';

const node_env = env<string>('node env', 'development');
const name = env('name', 'BarBar');
const email = env('email user', 'admin@gmail.com');
const ip_address = env('ip address', '0.0.0.0');
const port = env('port', Math.floor(Math.random() * 1_000) + 3_000);

/**
 * Configuration object for the application
 *
 * This object contains various configuration settings for the application,
 * including server details, database connection, allowed origins, and authentication settings.
 */
const config = {
  server: {
    name,
    node_env,
    ip_address,
    port,
    isDevelopment: node_env !== 'production',
    allowed_origins: env('allowed origins', ['*']),
    developer: env('developer', 'Shaishab Chandra Shil'),
    href: 'http://localhost:3000',
    logo: env('logo', '/images/logo.png'),
    default_avatar: env('default avatar', '/images/placeholder.png'),
  },
  url: {
    database: env(
      'database url',
      `mongodb://127.0.0.1:27017/${name.toLowerCase().replace(' ', '-')}`,
    ),
    redis: env('redis url', 'redis://redis:6379'),
    payment: {
      success: env('payment success url', `/payment/success`),
      cancel: env('payment cancel url', `/payment/cancel`),
    },
    api_doc: env('api doc', ''),
  },
  bcrypt_salt_rounds: env('bcrypt salt rounds', 10),
  jwt: {
    access_token: {
      secret: env('jwt access secret', genSecret()),
      expire_in: env<ms.StringValue>('jwt access expire in', '1d'),
    },
    refresh_token: {
      secret: env('jwt refresh secret', genSecret()),
      expire_in: env<ms.StringValue>('jwt refresh expire in', '30d'),
    },
    reset_token: {
      secret: env('jwt reset secret', genSecret()),
      expire_in: env<ms.StringValue>('jwt reset expire in', '10m'),
    },
  },
  payment: {
    stripe: {
      secret: env('stripe secret', ''),
      webhook: env('stripe webhook', ''),
    },
    methods: env<[string, ...string[]]>('payment methods', ['card']),
    default_method: env('default payment method', 'card'),
  },
  email: {
    user: email,
    from: `${name} <${email}>`,
    port: env('email port', 587),
    host: env('email host', 'smtp.gmail.com'),
    pass: env('email pass', ''),
  },
  admin: {
    name: env('admin name', 'Mr. Admin'),
    email: env('admin email', email),
    password: env('admin password', genSecret(4)),
  },
  otp: {
    exp: env<ms.StringValue>('otp expire in', '10m'),
    length: env('otp length', 6),
    limit: env('otp limit', 2),
    window: env<ms.StringValue>('otp window', '10s'),
  },
  salon: {
    default_service_duration: env<ms.StringValue>(
      'default service duration',
      '30m',
    ),
  },
  ai: {
    gemini: {
      key: env('gemini key', ''),
    },
  },
};

export default config;
