export const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, _req, res, _next) => {
  const status = error.statusCode || 500;
  res.status(status).json({
    message: error.message || "Server error",
    errors: error.errors || undefined
  });
};
