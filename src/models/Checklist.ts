import mongoose, { Schema } from 'mongoose';

const checklistSchema = new Schema({
  booking:   { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  vehicle:   { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  type:      { type: String, enum: ['pickup', 'return'], required: true },
  filledBy:  { type: String, enum: ['rider', 'owner'], required: true },
  items: [{
    label:   { type: String, required: true },
    checked: { type: Boolean, default: false },
  }],
  signature:    { type: String }, // base64
  agreedByBoth: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Checklist', checklistSchema);