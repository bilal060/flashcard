import { ConfigProps } from './config.interface';

export const config = (): ConfigProps => ({
  DB_URL: process.env.DB_URL,
  APP_PORT: parseInt(process.env.APP_PORT),
  COMM_PORT: parseInt(process.env.COMM_PORT),
  JWT_SECRET: process.env.JWT_SECRET,
});
