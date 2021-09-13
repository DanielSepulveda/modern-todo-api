import { MongoConnectionError } from '../errors';
import { noop } from '../lib/utils';
import { Mongoose, DbConnection, ConnectionCallback } from '../types/db';

export type ErrorCallback = (error: Error) => void;
export type DebugCallback = (
  collectionName: string,
  method: string,
  query: any
) => void;

export type MongooseConnectionOptions = {
  mongoUrl: string;
  auth: {
    user: string;
    password: string;
  };
  env: {
    isProduction: boolean;
  };
  callbacks: {
    onStartConnection: ConnectionCallback;
    onConnectionError: ErrorCallback;
    onRecconnected: ConnectionCallback;
    onDisconnection: ConnectionCallback;
    onDebug?: DebugCallback;
  };
};

export class MongooseConnection implements DbConnection {
  private readonly mongoose: Mongoose;
  private readonly options: MongooseConnectionOptions;

  private onConnectedCallback: ConnectionCallback;
  private onCloseCallback: ConnectionCallback;

  constructor(mongoose: Mongoose, options: MongooseConnectionOptions) {
    this.options = options;
    this.mongoose = mongoose;

    this.onConnectedCallback = noop;
    this.onCloseCallback = noop;

    mongoose.connection.on('error', (...args) => {
      this.onError(...args);
    });
    mongoose.connection.on('connected', () => {
      this.onConnected();
    });
    mongoose.connection.on('disconnected', () => {
      this.onDisconnected();
    });
    mongoose.connection.on('reconnected', () => {
      this.onReconnected();
    });
    mongoose.connection.on('close', () => {
      this.onClose();
    });

    mongoose.set('returnOriginal', false);
  }

  public async connect(onConnectedCallback: ConnectionCallback) {
    this.onConnectedCallback = onConnectedCallback;
    this.options.callbacks.onStartConnection();
    await this.mongoose.connect(this.options.mongoUrl, {
      autoIndex: this.options.env.isProduction,
      authSource: 'admin',
      auth: {
        username: this.options.auth.user,
        password: this.options.auth.password,
      },
    });
  }

  public async close(onClosed: ConnectionCallback, force: boolean = false) {
    this.onCloseCallback = onClosed;
    await this.mongoose.connection
      .close(force)
      // This error is already handled with mongoose.connection.on('error')
      .catch(noop);
  }

  public setDebugCallback(callback: DebugCallback) {
    this.mongoose.set('debug', callback);
  }

  private onConnected() {
    this.onConnectedCallback();
  }

  private onClose() {
    this.onCloseCallback();
  }

  private onReconnected() {
    this.options.callbacks.onRecconnected();
  }

  private onError(error?: Error) {
    if (error != null) {
      this.options.callbacks.onConnectionError(error);
      return;
    }

    const connectionError = new MongoConnectionError(
      `Could not connect to MongoDB at ${this.options.mongoUrl}`
    );
    this.options.callbacks.onConnectionError(connectionError);
  }

  private onDisconnected() {
    this.options.callbacks.onDisconnection();
  }
}
