const errorHandler = (err, req, res, next) => {
  if (err.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "Email already exists"
    });
  }
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};

export default errorHandler;