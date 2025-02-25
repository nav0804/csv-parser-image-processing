const { AppError } = require('../lib/Errors');

const errorHandler = (err, _, res, next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.statusCode,
      code: err.code,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    });
    console.log(err);
  }

  next();
};

module.exports = errorHandler;
