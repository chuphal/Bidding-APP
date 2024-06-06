import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oauth2Client.setCredentials({
  access_token: process.env.ACCESS_TOKEN,
});

async function getAccessToken() {
  const res = await oauth2Client.getAccessToken();
  return res.token;
}

export { oauth2Client, getAccessToken };
