import mongoose from 'mongoose';

const MemorySchema = new mongoose.Schema({
  file_url: {
    type: String,
    required: [true, 'Please provide a file URL'],
  },
  type: {
    type: String, // 'image' or 'video'
    required: [true, 'Please provide the file type'],
    enum: ['image', 'video'],
  },
  caption: {
    type: String,
    default: '',
  },
  uploaded_by: {
    type: String,
    required: [true, 'Please provide the uploader username'],
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Memory || mongoose.model('Memory', MemorySchema);
