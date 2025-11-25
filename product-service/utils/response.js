const successResponse = (data, statusCode = 200) => ({
  statusCode,
  body: JSON.stringify({
    success: true,
    data,
  }),
});

const errorResponse = (message, statusCode = 400) => ({
  statusCode,
  body: JSON.stringify({
    success: false,
    error: message,
  }),
});

module.exports = {
  successResponse,
  errorResponse,
};
