import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { connect, sync } from './config/database';
dotenv.config();

//import routes
import authRouter from "./controllers/auth.routes";

const app = express();

//setup middlewares
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.json({ limit: "100mb" }));

// Connect to the database
async function initializeDatabase() {
    await connect();
    await sync();
  }
initializeDatabase();

//list of routes
//-=-=-=-should edit below this line to add your routes-=-=-=-=-//
app.get("/", (req, res) => {
  res.json({
    version: "1.0.0",
  });
});

app.use('/auth', authRouter);
//-=-=-=-=-should edit above this line to add your routes-=-=-=-=-//

app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
