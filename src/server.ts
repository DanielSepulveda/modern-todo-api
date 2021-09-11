import util from 'util';
import { processExceptions, processSignals } from '@constants';
import { MongooseConnection } from '@db';
import { Logger } from '@providers';
import pino from 'pino';
// import ExpressPinoLogger from 'express-pino-logger';
import { config, validateConfig } from './config';

require('module-alias/register');

validateConfig(config, () => {
  Logger.error('Invalid env variables.');
  process.exit(1);
});

// const expressPinoLogger = ExpressPinoLogger({
//   logger: Logger,
// });

const mongooseConnection = new MongooseConnection({
  mongoUrl: config.mongoUrl,
  onStartConnection: (mongoUrl) => {
    Logger.info(`Connecting to MongoDB at ${mongoUrl}`);
  },
  onConnected: (mongoUrl) => {
    Logger.info(`Connected to MongoDB at ${mongoUrl}`);
  },
  onConnectionError: (error, mongoUrl) => {
    Logger.error(error, `Could not connect to MongoDB at ${mongoUrl}`);
  },
  onRecconnected: (mongoUrl) => {
    Logger.info(`Reconnected to MongoDB at ${mongoUrl}`);
  },
  onDisconnection: (error, mongoUrl) => {
    Logger.info(error, `Disconnected from MongoDB at ${mongoUrl}`);
  },
});

if (config.isDevelopment) {
  mongooseConnection.setDebugCallback((collectionName, method, query) => {
    const message = `${collectionName}.${method}(${util.inspect(query, {
      colors: true,
      depth: null,
    })})`;

    Logger.debug(message);
  });
}

[...processExceptions, ...processSignals].forEach((signal) => {
  process.on(
    signal,
    pino.final(Logger, (err, finalLogger) => {
      finalLogger.error(err, signal);
      mongooseConnection.close((mongoUrl) => {
        finalLogger.info(`Closed connection to MongoDB at ${mongoUrl}`);
      });
      process.exit(1);
    })
  );
});
