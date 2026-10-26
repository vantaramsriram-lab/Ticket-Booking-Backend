import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
export const authenticateUser = (req, res, next) => {
  const header = req.headers.authorization
  const token = header?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "token not provided"
    })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded
    next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
}
export const authoriseAdmin = (req, res, next) => {
  const user = req.user;
  if (user.role !== 'admin') {
    return next(new AppError("Not Authorised", 403));
  }
  next();
}