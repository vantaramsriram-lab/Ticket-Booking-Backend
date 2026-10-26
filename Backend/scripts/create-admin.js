import "dotenv/config";
import bcrypt from "bcrypt";
import pool from "../src/db/pool.js";

const createAdmin = async () => {
  try {
    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !email || !password) {
      throw new Error(
        "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env"
      );
    }

    const existingUser = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (existingUser.rowCount > 0) {
      console.log("User with this email already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'admin')
       RETURNING id, name, email, role`,
      [name, email, hashedPassword]
    );

    console.log("Admin created successfully:");
    console.log(result.rows[0]);
  } catch (error) {
    console.error("Failed to create admin:", error.message);
  } finally {
    await pool.end();
  }
};

createAdmin();