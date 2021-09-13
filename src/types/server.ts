import pino from 'pino';
import { DbConnection } from '../types/db';

export type OnSignalParams = {
  db: DbConnection;
  logger: pino.Logger;
};

export type HealthCheckData = {
  uptime: number;
  status: string;
  date: Date;
};
