import http from 'http';
import { createTerminus } from '@godaddy/terminus';
import pino from 'pino';
import { DbConnection } from 'types/db';
import { processExceptions, processSignals } from '../constants';
import { onHealthCheck, onShutdown, onSignal } from './utils';

type SetupGracefulShutdown = {
  server: http.Server;
  db: DbConnection;
  logger: pino.Logger;
};

export function setupGracefulShutdown(config: SetupGracefulShutdown) {
  createTerminus(config.server, {
    healthChecks: {
      '/healthcheck': async () => {
        return onHealthCheck();
      },
    },
    signals: [...processExceptions, ...processSignals],
    onSignal: async () => {
      return await onSignal({
        db: config.db,
        logger: config.logger,
      });
    },
    onShutdown: async () => {
      onShutdown(config.logger);
    },
    logger: (message, error) => config.logger.error(error, message),
  });
}
