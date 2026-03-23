import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema({
  user:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title:   { type: String, required: true },
  body:    { type: String, required: true },
  type:    {
    type: String,
    enum: ['booking_created', 'booking_approved', 'booking_rejected', 'booking_cancelled', 'ride_started', 'ride_completed', 'new_message', 'document_verified', 'document_rejected'],
    required: true,
  },
  read:    { type: Boolean, default: false },
  link:    { type: String }, // click karne pe kahan jaye
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);