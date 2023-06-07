import mongoose, { Schema, Types } from "mongoose";

export interface OpportunitySchema {
  _id: Types.ObjectId;
  projectName: string;
  role: string;
  domain: string;
  hackathon: string;
  description: string;
  skills: Array<{ id: string; text: string }>;
  link: string;
  emailAddress: string;
  phoneNumber: string;
  createdBy: Types.ObjectId;
}

const opportunitySchema = new Schema<OpportunitySchema>(
  {
    projectName: {
      type: String,
      required: true,
      min: 3,
      max: 30,
    },
    role: {
      type: String,
      required: true,
      min: 3,
      max: 30,
    },
    domain: {
      type: String,
      required: true,
      enum: ["Design", "Tech", "Management", "Other"],
    },
    hackathon: {
      type: String,
      enum: ["-", "DEVSOC", "Ignitia"],
    },
    description: {
      type: String,
      min: 3,
      max: 1000,
    },
    skills: {
      type: [{ id: String, text: String }],
    },
    link: {
      type: String,
      match: /^https:\/\/.*/,
      message: "Link must start with 'https://'",
    },
    emailAddress: {
      type: String,
      required: true,
      match: /^\S+@\S+\.\S+$/,
    },
    phoneNumber: {
      type: String,
      match: /^\d{10}$/,
      message: "Phone number must be 10 digits",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Opportunity = mongoose.model<OpportunitySchema>(
  "Opportunity",
  opportunitySchema
);
