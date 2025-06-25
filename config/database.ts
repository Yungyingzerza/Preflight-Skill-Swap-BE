import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  process.env.DATABASE as string, // Database name
  process.env.USER_DB as string, // Username
  process.env.PASSWORD as string, // Password
  {
    host: process.env.HOST as string, // Connect to your local database otherwise use 61.7.143.204
    dialect: "postgres", // Tell sequelize to use Postgres
    logging: false, // Disable logging
  }
);
async function connect() {
  try {
    await sequelize.authenticate();
    console.log("Connection established successfully");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

async function sync() {
  try {
    await sequelize.sync();
    console.log("Connection synced successfully");
  } catch (error) {
    console.error("Unable to sync to the database:", error);
  }
}

export { sequelize, connect, sync };