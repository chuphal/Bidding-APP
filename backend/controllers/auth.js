import pool from "../db/dbConfig.js";
import { BadRequestError } from "../errors/bad-request.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import { StatusCodes } from "http-status-codes";

export const register = async (req, res) => {
  const { id, username, password, email, role } = req.body;

  if (!username || !email || !password) {
    throw new BadRequestError("Please provide  name, email and password");
  }
  if (password.length < 6) {
    throw new BadRequestError("Password should be at least 6 charaters");
  }

  let rerole = role;
  if (!role) {
    rerole = "user";
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const user = await pool.query(
      `INSERT INTO users (username, password, email, role) VALUES ($1, $2, $3, $4)
      RETURNING username, role`,
      [username, hashedPassword, email, rerole]
    );
    generateTokenAndSetCookie(
      { userId: id, username: username, role: rerole },
      res
    );
    res
      .status(StatusCodes.CREATED)
      .json({ msg: "Registered successfully", user: user.rows });
  } catch (error) {
    throw new BadRequestError(
      "User already exist,please provide unique name, email and password"
    );
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  if (user.rowCount === 0) {
    throw new BadRequestError("Invalid username or password");
  }
  const encryptPassword = user.rows[0].password;
  const isPasswordCorrect = await bcrypt.compare(
    password,
    encryptPassword || ""
  );

  if (!user || !isPasswordCorrect) {
    throw new BadRequestError("Invalid username or password");
  }

  generateTokenAndSetCookie(
    {
      userId: user.rows[0].id,
      username: user.rows[0].username,
      rerole: user.rows[0].role,
    },
    res
  );

  res
    .status(StatusCodes.OK)
    .json({ msg: "Login successfully", user: user.rows });
};

export const profile = (req, res) => {
  res.send("profile route");
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(StatusCodes.OK).json({ msg: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};
