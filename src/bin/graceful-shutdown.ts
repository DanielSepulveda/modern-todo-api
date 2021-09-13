import http from 'http';
import { createTerminus } from '@godaddy/terminus';
import { createHttpTerminator } from 'http-terminator';
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
  const httpTerminator = createHttpTerminator({
    server: config.server,
  });

  createTerminus(config.server, {
    healthChecks: {
      '/healthcheck': async () => {
        return onHealthCheck();
      },
    },
    signals: [...processExceptions, ...processSignals],
    onSignal: async () => {
      return await onSignal({
        server: httpTerminator,
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
