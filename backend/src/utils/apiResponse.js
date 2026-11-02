export const successResponse = (res, statusCode = 200, message = 'Operation successful', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data !== null && typeof data === 'object' ? data : { result: data },
  });
};

export const errorResponse = (res, statusCode = 500, message = 'An error occurred', errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
  });
};
