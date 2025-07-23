import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { connect, sync } from "./config/database";
import { app } from "./socket/socket";
dotenv.config();

//import routes
import authRouter from "./controllers/auth.routes";
import chatRouter from "./controllers/chat.routes";
import browseRouter from "./controllers/browse.routes";
import mainRouter from "./controllers/main.routes";
import requestRouter from "./controllers/request.routes";
import skillRouter from "./controllers/skill.routes";

//setup middlewares
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://skillswap.yungying.com",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.json({ limit: "100mb" }));

// Middleware to validate Content-Type for multipart/form-data
app.use((req: Request, res: Response, next: NextFunction): void => {
  const contentType = req.headers["content-type"];

  // Check if the request has Content-Type multipart/form-data
  if (contentType && contentType.startsWith("multipart/form-data")) {
    // Check for the boundary in the Content-Type header
    if (!contentType.includes("boundary")) {
      res.status(400).send("Bad Request: Multipart boundary not found");
      return;
    }
  }
  next(); // Proceed if the Content-Type is correct
});

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
    version: "1.1.0",
  });
});

app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/browse", browseRouter);
app.use("/main", mainRouter);
app.use("/request", requestRouter);
app.use("/skill", skillRouter);
//-=-=-=-=-should edit above this line to add your routes-=-=-=-=-//

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    //make the file name unique by hashing the current date and time gene uuid
    const extension = path.extname(file.originalname);
    cb(null, uuidv4().toString() + Date.now() + extension);
  },
});

const upload = multer({ storage: storage });

app.use("/uploads", express.static("uploads"));

app.post("/upload", upload.single("file"), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).send("No file uploaded.");
    return;
  }
  res.json({ filePath: `${process.env.DOMAIN}/uploads/${req.file.filename}` });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
