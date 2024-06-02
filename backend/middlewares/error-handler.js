import { CustomAPIError } from "../errors/index.js";
import { StatusCodes } from "http-status-codes";

const errorHandlerMiddleware = (err, req, res, next) => {
  // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);

  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ msg: err.message });
  }

  console.log("error handler", err);
  return res.status(500).json({ msg: err });
};

export { errorHandlerMiddleware };
