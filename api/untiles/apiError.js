class ApiError extends Error {
    constructor(status, field, message, isOperational = true, stack = '') {
        super(message);
        this.status = status;
        this.field = field;
        this.isOperational = isOperational;
        if (stack) {
          this.stack = stack;
        } else {
          Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = ApiError;
