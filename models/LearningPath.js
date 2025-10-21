// models/LearningPath.js
import mongoose from 'mongoose';

const learningPathSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 200 
  },
  description: { 
    type: String, 
    required: true, 
    maxlength: 1000 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['sensor', 'communication', 'automation', 'ai-ml', 'robotics', 'energy', 'IoT', 'AI', 'Web', 'Mobile']
  },
  difficulty: { 
    type: String, 
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  estimatedTime: { 
    type: String,
    default: ''
  },
  tutorials: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tutorial' 
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

learningPathSchema.index({ category: 1, difficulty: 1 });
learningPathSchema.index({ active: 1, createdAt: -1 });

export const LearningPath = mongoose.model('LearningPath', learningPathSchema);