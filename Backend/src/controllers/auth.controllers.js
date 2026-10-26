import pool from "../db/pool.js"
import bcrypt from "bcrypt"
import AppError from "../utils/appError.js"
import jwt from "jsonwebtoken"
const register = async (req, res) => {
  const { name, email, password } = req.body
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(`
    insert into users (name, email, password)
    values ($1, $2, $3)
     RETURNING id, email, role
    `, [name, email, hashedPassword])
  res.status(201).json({
    "success": true,
    "message": "User registered successfully",
    "user": result.rows[0]
  })
}
const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query(`
    select id, email, role, password from users where users.email = $1
    `, [email])
  if (!result.rowCount) {
    throw new AppError("Invalid email or password", 401)
  }
  const user = result.rows[0];
  const isPassValid = await bcrypt.compare(password, user.password)
  if (!isPassValid) {
    throw new AppError("Invalid email or password", 401);
  }
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  )
  res.status(200).json({
    success: true,
    message: "Login successful",
    token
  })
}
export const getMe = async (req, res) => {
  const user = req.user
  res.status(200).json({
    userId: user.userId,
    role: user.role
  })
}
export { register, login }