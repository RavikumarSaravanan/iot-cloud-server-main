// import mongoose from 'mongoose';

// const tutorialSchema = new mongoose.Schema({
//   title: { type: String, required: true, trim: true },
//   description: { type: String, required: true },
//   category: { type: String, enum: ['sensor', 'communication', 'automation', 'ai-ml', 'robotics', 'energy'], default: 'sensor' },
//   difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
//   components: [{ type: String, trim: true }],
//   codeSnippet: { type: String, required: true },
//   architecture: { type: String }, // Base64 encoded SVG or image URL
//   estimatedTime: { type: String, default: '30 minutes' },
//   author: { type: String, default: 'Knowledge Garden Team' },
//   tags: [{ type: String, trim: true }],
//   isActive: { type: Boolean, default: true }
// }, { timestamps: true });

// export const Tutorial = mongoose.model('Tutorial', tutorialSchema);

// models/Tutorial.js
import mongoose from 'mongoose';

const tutorialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['sensor', 'communication', 'automation', 'ai-ml', 'robotics', 'energy']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  components: [{
    type: String,
    trim: true
  }],
  codeSnippet: {
    type: String,
    required: true
  },
  architecture: {
    type: String, // Base64 encoded image or URL
    default: ''
  },
  estimatedTime: {
    type: String,
    default: ''
  },
  author: {
    type: String,
    default: 'Knowledge Garden Team'
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
tutorialSchema.index({ category: 1, difficulty: 1 });
tutorialSchema.index({ active: 1, createdAt: -1 });

const Tutorial = mongoose.model('Tutorial', tutorialSchema);

export default Tutorial;
