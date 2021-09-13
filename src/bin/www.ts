import http from 'http';
import util from 'util';
import mongoose from 'mongoose';
import pino from 'pino';
import { app } from '../app';
import { config } from '../config';
import { MongooseConnection, MongooseConnectionOptions } from '../db';
import { Logger } from '../providers';
import { setupGracefulShutdown } from './graceful-shutdown';
// import ExpressPinoLogger from 'express-pino-logger';

// const expressPinoLogger = ExpressPinoLogger({
//   logger: Logger,
// });

const mongooseCallbacks: MongooseConnectionOptions['callbacks'] = {
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

const mongooseOptions: MongooseConnectionOptions = {
  mongoUrl: config.mongoUrl,
  auth: {
    user: config.mongo.user,
    password: config.mongo.password,
  },
  env: {
    isProduction: config.isProduction,
  },
  callbacks: mongooseCallbacks,
};

const mongooseConnection = new MongooseConnection(mongoose, mongooseOptions);

const server = http.createServer(app);

setupGracefulShutdown({
  server,
  db: mongooseConnection,
  logger: pino.final(Logger),
});

const serve = async () => {
  await mongooseConnection.connect(() => {
    Logger.info(`Connected to MongoDB at ${config.mongoUrl}`);
  });

  server.listen(config.port, () => {
    Logger.info(`Express server started at port ${String(config.port)}`);
  });
};

serve().catch(() => {});
