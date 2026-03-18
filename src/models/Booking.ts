import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  vehicle: mongoose.Types.ObjectId;
  rider: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  start: Date;
  end: Date;
  durationType: "hour" | "day" | "week";
  pickupLocation: string;
  amount: number;
  deposit: number;
  status: "pending" | "approved" | "rejected" | "ongoing" | "completed" | "cancelled";
}

const bookingSchema = new Schema<IBooking>(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    rider: { type: Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    start: Date,
    end: Date,
    durationType: { type: String, enum: ["hour", "day", "week"], required: true },
    pickupLocation: String,
    amount: { type: Number, default: 0 },
    deposit: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "ongoing", "completed", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>("Booking", bookingSchema);
