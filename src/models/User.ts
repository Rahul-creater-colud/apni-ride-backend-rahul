import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  phone:      { type: String, unique: true, required: true },
  name:       String,
  role:       { type: String, enum: ['rider', 'owner', 'admin'], default: 'rider' },
  avatarUrl:  String,
  otpHash:    String,
  otpExpires: Date,
  verified:   { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('User', userSchema);