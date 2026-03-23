import mongoose, { Schema } from 'mongoose';

const lateFineSchema = new Schema({
  booking:     { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  vehicle:     { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  rider:       { type: Schema.Types.ObjectId, ref: 'User',    required: true },
  scheduledEnd:{ type: Date, required: true },
  actualReturn:{ type: Date, required: true },
  lateHours:   { type: Number, required: true },
  ratePerHour: { type: Number, required: true },
  fineAmount:  { type: Number, required: true },
  status:      { type: String, enum: ['pending', 'paid', 'waived'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('LateFine', lateFineSchema);