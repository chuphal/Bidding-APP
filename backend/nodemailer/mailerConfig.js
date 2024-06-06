import nodemailer from "nodemailer";
import { getAccessToken } from "./oauth2Config.js";
import dotenv from "dotenv";

dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.SERVICE_EMAIL,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken: getAccessToken(), // Function to get the access token
  },
});

export default transporter;
