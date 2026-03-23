import mongoose, { Schema } from 'mongoose';

const conditionReportSchema = new Schema({
  booking:    { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  vehicle:    { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  reportType: { type: String, enum: ['pickup', 'return'], required: true },
  createdBy:  { type: Schema.Types.ObjectId, ref: 'User',   required: true },
  photos:     [{ type: String }],
  fuelLevel:  { type: String, enum: ['empty', 'quarter', 'half', 'three_quarter', 'full'], required: true },
  odometer:   { type: Number },
  condition:  { type: String, enum: ['excellent', 'good', 'fair', 'poor'], required: true },
  damages:    [{ part: String, description: String, photo: String }],
  notes:      { type: String, maxlength: 500 },
  signature:  { type: String }, // base64 signature image
}, { timestamps: true });

export default mongoose.model('ConditionReport', conditionReportSchema);