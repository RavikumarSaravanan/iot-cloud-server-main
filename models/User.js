import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin','user'], default: 'user' }
}, { timestamps: true });

userSchema.methods.setPassword = async function(password){
  this.passwordHash = await bcrypt.hash(password, 12);
}
userSchema.methods.validatePassword = async function(password){
  return bcrypt.compare(password, this.passwordHash);
}

export const User = mongoose.model('User', userSchema);
