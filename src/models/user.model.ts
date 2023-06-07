import mongoose, { Document, Schema, Types } from "mongoose";

export interface UserSchema extends Document {
  _id: Types.ObjectId;
  googleId: string;
  email: string;
  name: string;
  opportunities: Types.ObjectId[];
}

const userSchema = new Schema<UserSchema>(
  {
    googleId: {
      type: String,
    },
    email: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      min: 3,
      max: 20,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<UserSchema>("User", userSchema);
