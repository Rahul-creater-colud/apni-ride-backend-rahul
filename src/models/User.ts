import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  phone: string;
  name?: string;
  role: "rider" | "owner" | "admin";
  avatarUrl?: string;
  otpHash?: string;
  otpExpires?: Date;
  verified: boolean;
}

const userSchema = new Schema<IUser>(
  {
    phone: { type: String, unique: true, required: true },
    name: String,
    role: { type: String, enum: ["rider", "owner", "admin"], default: "rider" },
    avatarUrl: String,
    otpHash: String,
    otpExpires: Date,
    verified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
