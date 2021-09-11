export class MongoConnectionError extends Error {
  private static readonly defaultMessage = 'Could not connect to MongoDB';

  constructor(message: string = MongoConnectionError.defaultMessage) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
