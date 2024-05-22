import dotenv from "dotenv";
dotenv.config();

// DO NOT DELETE THIS FILE
// MAKE A COPY OF THIS FILE AND RENAME IT TO mssqlConnection.ts THEN ADD YOUR OWN CONFIGURATION TO

export const mssqlConfig = {
  database: "YOUR_DATABASE_NAME",
  port: 1433,
  user: "YOUR_USERNAME",
  password: "YOUR_PASSWORD",
  server: "localhost",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};
