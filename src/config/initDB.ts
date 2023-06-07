import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

interface MongooseConnectOptions extends mongoose.ConnectOptions {
  useNewUrlParser: boolean;
  useUnifiedTopology: boolean;
}

export const initDB = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as MongooseConnectOptions)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.log("Error connecting to MongoDB", err);
    });
};
