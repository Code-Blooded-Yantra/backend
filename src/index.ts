import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { initDB } from "./config/initDB";

import userRouter from "./routers/user.router";

const app = express();
dotenv.config();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    // credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initDB();

app.use("/user", userRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Backend server is running on port ${process.env.PORT}`);
});

export default app;
