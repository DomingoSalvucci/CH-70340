import dotenv from "dotenv";
 
dotenv.config();

export default {
  PORT: process.env.PORT,
  MONGO_URL: process.env.MONGO_URL,
  MONGO_URL_SESSION: process.env.MONGO_URL_SESSION,
  SECRET: process.env.SECRET,
  GITHUB_CLIENT_ID : process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL : process.env.GITHUB_CALLBACK_URL
}
