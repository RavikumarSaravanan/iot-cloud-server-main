import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  when: { type: Date },
  cat: { type: String, enum: ['event','workshop','competition'], default: 'event' },
  venue: { type: String, trim: true, maxlength: 120 },
  status: { type: String, enum: ['open','closed'], default: 'open' }
}, { timestamps: true });

notificationSchema.index({ when: -1 });
notificationSchema.index({ title: 'text', venue: 'text' });

export const Notification = mongoose.model('Notification', notificationSchema);
