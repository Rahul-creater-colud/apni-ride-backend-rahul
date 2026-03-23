import mongoose, { Schema } from 'mongoose';

const messageSchema = new Schema({
  booking:  { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  sender:   { type: Schema.Types.ObjectId, ref: 'User',    required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User',    required: true },
  text:     { type: String, required: true, maxlength: 500 },
  read:     { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);