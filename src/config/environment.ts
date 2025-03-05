import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs-extra';

const environment = process.env.NODE_ENV || 'development';

let envFile = '.env';
if (environment === 'development') {
  envFile = '.env.development';
} else if (environment === 'production') {
  envFile = '.env.production';
}

const envPath = path.resolve(process.cwd(), envFile);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
  console.warn(`Environment file ${envFile} not found, using default .env`);
}

export const ELECTRON_APP_NAME = process.env.ELECTRON_APP_NAME || '';
export const DB_NAME = process.env.DB_NAME || 'sqlite.db';
export const REACT_APP_ENV = process.env.REACT_APP_ENV || 'development';

export default {
  environment,
  ELECTRON_APP_NAME,
  DB_NAME,
  REACT_APP_ENV,
};
