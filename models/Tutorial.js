<<<<<<< HEAD
import mongoose from 'mongoose';

const tutorialSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['sensor', 'communication', 'automation', 'ai-ml', 'robotics', 'energy'], default: 'sensor' },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  components: [{ type: String, trim: true }],
  codeSnippet: { type: String, required: true },
  architecture: { type: String }, // Base64 encoded SVG or image URL
  estimatedTime: { type: String, default: '30 minutes' },
  author: { type: String, default: 'Knowledge Garden Team' },
  tags: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

=======
import mongoose from 'mongoose';

const tutorialSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['sensor', 'communication', 'automation', 'ai-ml', 'robotics', 'energy'], default: 'sensor' },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  components: [{ type: String, trim: true }],
  codeSnippet: { type: String, required: true },
  architecture: { type: String }, // Base64 encoded SVG or image URL
  estimatedTime: { type: String, default: '30 minutes' },
  author: { type: String, default: 'Knowledge Garden Team' },
  tags: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

>>>>>>> ffe8e6a (Initial commit)
export const Tutorial = mongoose.model('Tutorial', tutorialSchema);