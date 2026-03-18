import mongoose, { Schema, Document } from "mongoose";

export interface IVehicle extends Document {
  owner: mongoose.Types.ObjectId;
  type: "bike" | "car";
  brand: string;
  model: string;
  fuelType: string;
  price: { hour: number; day: number; week: number };
  images: string[];
  location: { type: "Point"; coordinates: [number, number] };
  status: "active" | "inactive";
}

const vehicleSchema = new Schema<IVehicle>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["bike", "car"], required: true },
    brand: String,
    model: String,
    fuelType: String,
    price: {
      hour: Number,
      day: Number,
      week: Number
    },
    images: [String],
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" }
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
  },
  { timestamps: true }
);

export default mongoose.model<IVehicle>("Vehicle", vehicleSchema);
