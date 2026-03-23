import mongoose, { Schema } from 'mongoose';

const bookingSchema = new Schema({
  vehicle:        { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  rider:          { type: Schema.Types.ObjectId, ref: 'User',    required: true },
  owner:          { type: Schema.Types.ObjectId, ref: 'User',    required: true },
  start:          { type: Date, required: true },
  end:            { type: Date, required: true },
  durationType:   { type: String, enum: ['hour', 'day', 'week'], required: true },
  pickupLocation: { type: String, required: true },
  amount:         { type: Number, default: 0 },
  deposit:        { type: Number, default: 0 },
  status: {
    type:    String,
    enum:    ['pending', 'approved', 'rejected', 'ongoing', 'completed', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type:    String,
    enum:    ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);