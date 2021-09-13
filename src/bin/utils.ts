import pino from 'pino';
import { HealthCheckData, OnSignalParams } from '../types/server';

export async function onSignal(params: OnSignalParams) {
  params.logger.warn('Server is starting to gracefully shut down');

  await params.db.close(() => {
    params.logger.warn(`Db connection closed`);
  });
}

export function onShutdown(logger: pino.Logger) {
  logger.warn('Cleanup finished, server is shutting down.');
}

export function onHealthCheck(): HealthCheckData {
  const data = {
    uptime: process.uptime(),
    status: 'UP',
    date: new Date(),
  };

  return data;
}
