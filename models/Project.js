// import mongoose from 'mongoose';

// const projectSchema = new mongoose.Schema({
//   title: { type: String, required: true, trim: true, maxlength: 160 },
//   track: { type: String, enum: ['IoT','AI','Robotics','Web','Mobile'], default: 'IoT' },
//   authors: { type: String, trim: true, maxlength: 240 },
//   desc: { type: String, trim: true, maxlength: 1000 },
//   url: { type: String, trim: true, maxlength: 500 }, // Reference URL field
//   img: { type: String, trim: true }, // URL (served from /uploads)
// }, { timestamps: true });

// projectSchema.index({ createdAt: -1 });
// projectSchema.index({ title: 'text', desc: 'text', authors: 'text' });

// export const Project = mongoose.model('Project', projectSchema);
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  track: { type: String, enum: ['IoT','AI','Robotics','Web','Mobile'], default: 'IoT' },
  authors: { type: String, trim: true, maxlength: 240 },
  desc: { type: String, trim: true, maxlength: 1000 },
  url: { type: String, trim: true, maxlength: 500 }, // Reference URL field
  img: { type: String, trim: true }, // URL (served from /uploads)
}, { timestamps: true });

projectSchema.index({ createdAt: -1 });
projectSchema.index({ title: 'text', desc: 'text', authors: 'text' });

export const Project = mongoose.model('Project', projectSchema);