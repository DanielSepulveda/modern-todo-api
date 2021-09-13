import mongoose from 'mongoose';

export type ConnectionCallback = () => void;

export type Mongoose = typeof mongoose;

export interface DbConnection {
  connect: (onConnectedCallback: ConnectionCallback) => Promise<void>;
  close: (
    onClosedCallback: ConnectionCallback,
    force?: boolean
  ) => Promise<void>;
}
