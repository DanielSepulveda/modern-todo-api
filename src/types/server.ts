import { HttpTerminator } from 'http-terminator';
import pino from 'pino';
import { DbConnection } from '../types/db';

export type OnSignalParams = {
  server: HttpTerminator;
  db: DbConnection;
  logger: pino.Logger;
};

export type HealthCheckData = {
  uptime: number;
  status: string;
  date: Date;
};
