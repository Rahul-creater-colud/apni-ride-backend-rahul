import mongoose, { Schema } from 'mongoose';

const documentSchema = new Schema({
  user:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type:     {
    type: String,
    enum: ['aadhaar', 'driving_license', 'vehicle_rc', 'vehicle_insurance', 'selfie'],
    required: true,
  },
  url:      { type: String, required: true },
  status:   { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  note:     { type: String }, // admin ka note
}, { timestamps: true });

export default mongoose.model('Document', documentSchema);