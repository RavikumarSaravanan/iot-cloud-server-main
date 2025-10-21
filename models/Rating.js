// models/Rating.js
import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  tutorial: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tutorial', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    trim: true, 
    maxlength: 500 
  }
}, { 
  timestamps: true 
});

// Ensure a user can only rate a tutorial once
ratingSchema.index({ tutorial: 1, user: 1 }, { unique: true });

ratingSchema.statics.getAverageRating = async function(tutorialId) {
  const result = await this.aggregate([
    { $match: { tutorial: new mongoose.Types.ObjectId(tutorialId) } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  
  return result.length > 0 ? { average: result[0].average, count: result[0].count } : { average: 0, count: 0 };
};

export const Rating = mongoose.model('Rating', ratingSchema);