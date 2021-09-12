import mongoose from 'mongoose';
import { config } from '../config';
import { MongoConnectionError } from '../errors';

export type ConnectionCallback = () => void;
export type ErrorCallback = (error: Error) => void;
export type DebugCallback = (
  collectionName: string,
  method: string,
  query: any
) => void;

const noop = () => {};

export interface Callbacks {
  onStartConnection: ConnectionCallback;
  onConnectionError: ErrorCallback;
  onRecconnected: ConnectionCallback;
  onDisconnection: ConnectionCallback;
  onDebug?: DebugCallback;
}

export class MongooseConnection {
  private onConnectedCallback: ConnectionCallback;
  private onCloseCallback: ConnectionCallback;
  private readonly callbacks: Callbacks;

  constructor(callbacks: Callbacks) {
    this.onConnectedCallback = noop;
    this.onCloseCallback = noop;
    this.callbacks = callbacks;

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
    this.callbacks.onStartConnection();
    await mongoose.connect(config.mongoUrl, {
      autoIndex: config.isProduction,
      authSource: 'admin',
      auth: {
        username: config.mongo.user,
        password: config.mongo.password,
      },
    });
  }

  public close(onClosed: ConnectionCallback, force: boolean = false) {
    this.onCloseCallback = onClosed;
    mongoose.connection
      .close(force)
      // This error is already handled with mongoose.connection.on('error')
      .catch(noop);
  }

  public setDebugCallback(callback: DebugCallback) {
    mongoose.set('debug', callback);
  }

  private onConnected() {
    this.onConnectedCallback();
  }

  private onClose() {
    this.onCloseCallback();
  }

  private onReconnected() {
    this.callbacks.onRecconnected();
  }

  private onError(error?: Error) {
    if (error != null) {
      this.callbacks.onConnectionError(error);
      return;
    }

    const connectionError = new MongoConnectionError(
      `Could not connect to MongoDB at ${config.mongoUrl}`
    );
    this.callbacks.onConnectionError(connectionError);
  }

  private onDisconnected() {
    this.callbacks.onDisconnection();
  }
}
