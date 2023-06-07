import mongoose, { Document, Schema, Types } from "mongoose";

export interface UserSchema extends Document {
  _id: Types.ObjectId;
  email: string;
  name: string;
  keywords: Array<string>;
}

const userSchema = new Schema<UserSchema>(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    keywords: {
      type: [String],
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<UserSchema>("User", userSchema);
