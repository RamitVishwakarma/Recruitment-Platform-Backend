class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error"; // 'fail' for 4xx, 'error' for 5xx
    this.isOperational = true; // To distinguish operational errors from programming errors

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
