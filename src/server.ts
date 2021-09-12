import util from 'util';
import { processExceptions, processSignals } from '@constants';
import { Callbacks, MongooseConnection } from '@db';
import { Logger } from '@providers';
import pino from 'pino';
// import ExpressPinoLogger from 'express-pino-logger';
import { app } from './app';
import { config, validateConfig } from './config';

validateConfig(config, () => {
  Logger.error('Invalid env variables.');
  process.exit(1);
});

// const expressPinoLogger = ExpressPinoLogger({
//   logger: Logger,
// });

const mongooseCallbacks: Callbacks = {
  onStartConnection() {
    Logger.info(`Connecting to MongoDB at ${config.mongoUrl}`);
  },
  onConnectionError(error) {
    Logger.error(error, `Could not connect to MongoDB at ${config.mongoUrl}`);
  },
  onRecconnected() {
    Logger.info(`Reconnected to MongoDB at ${config.mongoUrl}`);
  },
  onDisconnection() {
    Logger.info(`Disconnected from MongoDB at ${config.mongoUrl}`);
  },
};

if (config.isDevelopment) {
  mongooseCallbacks.onDebug = (collectionName, method, query) => {
    const message = `${collectionName}.${method}(${util.inspect(query, {
      colors: true,
      depth: null,
    })})`;

    Logger.debug(message);
  };
}

const mongooseConnection = new MongooseConnection(mongooseCallbacks);

const serve = () =>
  app.listen(config.port, () => {
    Logger.info(`Express server started at ${config.url}`);
  });

mongooseConnection.connect(() => {
  Logger.info(`Connected to MongoDB at ${config.mongoUrl}`);
  serve();
});

[...processExceptions, ...processSignals].forEach((signal) => {
  process.on(
    signal,
    pino.final(Logger, (err, finalLogger) => {
      finalLogger.error(err, signal);
      mongooseConnection.close(() => {
        finalLogger.info(`Closed connection to MongoDB at ${config.mongoUrl}`);
      });
      process.exit(1);
    })
  );
});
