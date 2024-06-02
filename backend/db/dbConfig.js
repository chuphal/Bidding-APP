import pg from "pg";
// import dotenv from "dotenv";

// dotenv.config();

// const isProduction = process.env.NODE_DEV === "production";

// const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

// const pool = new pg.Client({
//   connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
// });

const pool = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "bidding",
  password: "Chandan@123#",
  port: 5432,
});

export default pool;
