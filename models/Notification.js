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


// import mongoose from 'mongoose';

// const forumPostSchema = new mongoose.Schema({
//   title: { 
//     type: String, 
//     required: true, 
//     trim: true, 
//     maxlength: 200 
//   },
//   content: { 
//     type: String, 
//     required: true, 
//     maxlength: 5000 
//   },
//   category: { 
//     type: String, 
//     required: true,
//     enum: ['general', 'tutorials', 'projects', 'help', 'announcements']
//   },
//   author: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     required: true 
//   },
//   tags: [{ 
//     type: String, 
//     trim: true 
//   }],
//   replies: [{ 
//     author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     content: { type: String, maxlength: 2000 },
//     createdAt: { type: Date, default: Date.now }
//   }],
//   views: { 
//     type: Number, 
//     default: 0 
//   },
//   pinned: { 
//     type: Boolean, 
//     default: false 
//   },
//   locked: { 
//     type: Boolean, 
//     default: false 
//   }
// }, { 
//   timestamps: true 
// });

// forumPostSchema.index({ category: 1, createdAt: -1 });
// forumPostSchema.index({ title: 'text', content: 'text' });

// export const ForumPost = mongoose.model('ForumPost', forumPostSchema);