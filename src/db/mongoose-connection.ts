import { MongoConnectionError } from '@errors';
import mongoose, { ConnectOptions } from 'mongoose';

export type ConnectionCallback = (mongoUrl: string) => void;
export type ErrorCallback = (error: Error, mongoUrl: string) => void;
export type DebugCallback = (
  collectionName: string,
  method: string,
  query: any
) => void;

const defaultConnectedCallback: ConnectionCallback = () => {};
const defaultClosedCallback: ConnectionCallback = () => {};

export interface MongooseConnectionOptions {
  mongoUrl: string;
  onStartConnection: ConnectionCallback;
  onConnectionError: ErrorCallback;
  onRecconnected: ConnectionCallback;
  onDisconnection: ErrorCallback;
}

const defaultMongooseConnectOptions: ConnectOptions = {
  // autoIndex: false // Maybe set this in production
};

export class MongooseConnection {
  private readonly options: MongooseConnectionOptions;

  private onConnectedCallback: ConnectionCallback;
  private onCloseCallback: ConnectionCallback;

  constructor(options: MongooseConnectionOptions) {
    this.options = options;
    this.onConnectedCallback = defaultConnectedCallback;
    this.onCloseCallback = defaultClosedCallback;

    mongoose.connection.on('error', this.onError);
    mongoose.connection.on('connected', this.onConnected);
    mongoose.connection.on('disconnected', this.onDisconnected);
    mongoose.connection.on('reconnected', this.onReconnected);
    mongoose.connection.on('close', this.onClose);

    mongoose.set('returnOriginal', false);
  }

  public connect(onConnectedCallback: ConnectionCallback) {
    this.onConnectedCallback = onConnectedCallback;
    this.options.onStartConnection(this.options.mongoUrl);
    mongoose
      .connect(this.options.mongoUrl, defaultMongooseConnectOptions)
      .catch(this.onError);
  }

  public close(onClosed: ConnectionCallback, force: boolean = false) {
    this.onCloseCallback = onClosed;
    mongoose.connection.close(force).catch(this.onError);
  }

  public setDebugCallback(callback: DebugCallback) {
    mongoose.set('debug', callback);
  }

  private onConnected() {
    this.onConnectedCallback(this.options.mongoUrl);
  }

  private onClose() {
    this.onCloseCallback(this.options.mongoUrl);
  }

  private onReconnected() {
    this.options.onRecconnected(this.options.mongoUrl);
  }

  private onError(error?: Error) {
    if (error != null) {
      this.options.onConnectionError(error, this.options.mongoUrl);
    }

    const connectionError = new MongoConnectionError(
      `Could not connect to MongoDB at ${this.options.mongoUrl}`
    );
    this.options.onConnectionError(connectionError, this.options.mongoUrl);
  }

  private onDisconnected(error?: Error) {
    if (error != null) {
      this.options.onDisconnection(error, this.options.mongoUrl);
    }

    const connectionError = new MongoConnectionError(
      `Disconnected from MongoDB at ${this.options.mongoUrl}`
    );
    this.options.onDisconnection(connectionError, this.options.mongoUrl);
  }
}
