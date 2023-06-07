import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import { errorHandler } from "./middleware/error.middleware";
import session from "express-session";
import MongoStore from "connect-mongo";

import { initDB } from "./config/initDB";
import { initPassport } from "./config/initPassport";
import authRouter from "./routers/auth.router";
import mongoose from "mongoose";
import opportunityRouter from "./routers/opportunity.router";
import cookieParser from "cookie-parser";
import userRouter from "./routers/user.router";

const app = express();
dotenv.config();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://top-landing-beta.vercel.app",
      "https://top-landing-git-main-top123.vercel.app",
      "https://top-landing-cv5a8tmn8-top123.vercel.app",
      "https://www.theopportunitiesportal.com",
      "https://top-landing-git-add-auth-top123.vercel.app",
      "https://www.testfrontend.theopportunitiesportal.com",
    ],
    credentials: true,
  })
);

app.set("trust proxy", 1);

//
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "*");
//   res.header("Access-Control-Allow-Credentials", "true");
//   next();
// });

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initDB();

const mongoStore = MongoStore.create({
  client: mongoose.connection.getClient(),
  collectionName: "sessions",
  autoRemove: "interval",
  autoRemoveInterval: 1, // In minutes
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: mongoStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Session expiration time in milliseconds
      sameSite: process.env.NODE_ENV === "PROD" ? "none" : "lax", // Set to "none" in production, "lax" in development
      secure: process.env.NODE_ENV === "PROD", // Set to true in production, false in development
      httpOnly: false,
      domain: process.env.NODE_ENV === "PROD" ? process.env.DOMAIN : undefined, // Set domain only in production
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

initPassport();

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/opportunity", opportunityRouter);

app.use(errorHandler);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Backend server is running on port ${process.env.PORT}`);
});

export default app;
