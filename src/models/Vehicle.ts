<<<<<<< HEAD
import mongoose, { Schema, Document } from "mongoose";

export interface IVehicle extends Document {
=======
import mongoose, { Schema } from "mongoose";

interface IVehicle {
>>>>>>> bf45d75a1d6da942d33451a41d52e1f129f8db75
  owner: mongoose.Types.ObjectId;
  type: "bike" | "car";
  brand: string;
  model: string;
  fuelType: string;
<<<<<<< HEAD
  price: { hour: number; day: number; week: number };
  images: string[];
  location: { type: "Point"; coordinates: [number, number] };
=======
  price: {
    hour: number;
    day: number;
    week: number;
  };
  images: string[];
  location: {
    type: "Point";
    coordinates: number[];
  };
>>>>>>> bf45d75a1d6da942d33451a41d52e1f129f8db75
  status: "active" | "inactive";
}

const vehicleSchema = new Schema<IVehicle>(
  {
<<<<<<< HEAD
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
=======
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["bike", "car"],
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    fuelType: {
      type: String,
      required: true,
    },
    price: {
      hour: { type: Number, required: true },
      day: { type: Number, required: true },
      week: { type: Number, required: true },
    },
    images: {
      type: [String],
      default: [],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
>>>>>>> bf45d75a1d6da942d33451a41d52e1f129f8db75
  },
  { timestamps: true }
);

<<<<<<< HEAD
export default mongoose.model<IVehicle>("Vehicle", vehicleSchema);
=======
export default mongoose.model("Vehicle", vehicleSchema);
  
>>>>>>> bf45d75a1d6da942d33451a41d52e1f129f8db75
