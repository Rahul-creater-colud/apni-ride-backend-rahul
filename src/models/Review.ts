import mongoose, { Schema } from 'mongoose';

const reviewSchema = new Schema({
  vehicle:  { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  rider:    { type: Schema.Types.ObjectId, ref: 'User',    required: true },
  booking:  { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  rating:   { type: Number, min: 1, max: 5, required: true },
  comment:  { type: String, maxlength: 500 },
}, { timestamps: true });

// Ek booking pe sirf ek review
reviewSchema.index({ booking: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);