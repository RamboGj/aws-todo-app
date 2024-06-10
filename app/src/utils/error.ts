export class BaseError extends Error {
  statusCode = 400;
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, BaseError.prototype);
  }
}
