// ------------------1-------------

// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// const userSchema = new mongoose.Schema({
//   email: { type: String, unique: true, required: true, lowercase: true, trim: true },
//   passwordHash: { type: String, required: true },
//   role: { type: String, enum: ['admin','user'], default: 'user' }
// }, { timestamps: true });

// userSchema.methods.setPassword = async function(password){
//   this.passwordHash = await bcrypt.hash(password, 12);
// }
// userSchema.methods.validatePassword = async function(password){
//   return bcrypt.compare(password, this.passwordHash);
// }

// export const User = mongoose.model('User', userSchema);


import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin','user'], default: 'user' },
  fullName: { type: String, trim: true, maxlength: 160 },
  profileImage: { type: String, trim: true },
  bio: { type: String, trim: true, maxlength: 500 },
  learningPaths: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'LearningPath' 
  }],
  completedTutorials: [{ 
    tutorial: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' },
    completedAt: { type: Date, default: Date.now }
  }],
  bookmarks: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tutorial' 
  }],
  enrolledPaths: [{ 
    path: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningPath' },
    enrolledAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 } // Percentage
  }]
}, { timestamps: true });

userSchema.methods.setPassword = async function(password){
  this.passwordHash = await bcrypt.hash(password, 12);
}
userSchema.methods.validatePassword = async function(password){
  return bcrypt.compare(password, this.passwordHash);
}

// Add method to add completed tutorial
userSchema.methods.addCompletedTutorial = async function(tutorialId) {
  // Check if tutorial is already completed
  const existing = this.completedTutorials.find(t => t.tutorial.toString() === tutorialId.toString());
  if (!existing) {
    this.completedTutorials.push({ tutorial: tutorialId });
    await this.save();
  }
  return this;
};

// Add method to bookmark tutorial
userSchema.methods.bookmarkTutorial = async function(tutorialId) {
  if (!this.bookmarks.includes(tutorialId)) {
    this.bookmarks.push(tutorialId);
    await this.save();
  }
  return this;
};

// Add method to unbookmark tutorial
userSchema.methods.unbookmarkTutorial = async function(tutorialId) {
  this.bookmarks = this.bookmarks.filter(id => id.toString() !== tutorialId.toString());
  await this.save();
  return this;
};

export const User = mongoose.model('User', userSchema);