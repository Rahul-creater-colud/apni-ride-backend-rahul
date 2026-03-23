import mongoose, { Schema } from 'mongoose';

const availabilitySchema = new Schema({
  vehicle:      { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  owner:        { type: Schema.Types.ObjectId, ref: 'User',    required: true },
  blockedDates: [{ type: String }], // format: 'YYYY-MM-DD'
}, { timestamps: true });

export default mongoose.model('Availability', availabilitySchema);