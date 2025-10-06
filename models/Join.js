import mongoose from 'mongoose';

const joinSchema = new mongoose.Schema({
  role: { type: String, enum: ['learner','mentor','partner'], default: 'learner' },
  fullName: { type: String, trim: true, maxlength: 160 },
  email: { type: String, trim: true, lowercase: true, maxlength: 160 },
  phone: { type: String, trim: true, maxlength: 40 },
  extra: { type: String, trim: true, maxlength: 240 },
  message: { type: String, trim: true, maxlength: 500 }
}, { timestamps: true });

joinSchema.index({ createdAt: -1 });

export const Join = mongoose.model('Join', joinSchema);
