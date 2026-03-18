import mongoose, { Schema } from "mongoose";

interface IVehicle {
  owner: mongoose.Types.ObjectId;
  type: "bike" | "car";
  brand: string;
  model: string;
  fuelType: string;
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
  status: "active" | "inactive";
}

const vehicleSchema = new Schema<IVehicle>(
  {
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
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);
  
