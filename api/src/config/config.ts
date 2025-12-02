// apps/api/src/config/config.ts
import * as dotenv from 'dotenv';
dotenv.config();

export const appConfig = {
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '3600s',
  db: {
    type: process.env.DB_TYPE || 'sqlite',
    database: process.env.DB_DATABASE || './data/turbovets.db',
  },
};
