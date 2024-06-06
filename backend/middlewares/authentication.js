import jwt from "jsonwebtoken";
import { UnauthenticatedError } from "../errors/index.js";

const authentication = (req, res, next) => {
  const token = req.cookies.jwt;
  // console.log(token);
  if (!token) {
    throw new UnauthenticatedError("Authentication Invalid. No token found");
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: payload.userId,
      username: payload.username,
      role: payload.rerole,
    };
    // console.log("payload", req.user);
    next();
  } catch (error) {
    console.log("auth-error", error);
    throw new UnauthenticatedError("Authentication Invalid");
  }
};

export default authentication;
