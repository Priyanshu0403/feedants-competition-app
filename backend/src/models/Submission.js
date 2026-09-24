const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    registration: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true, unique: true },
    competition: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ['video', 'image'], default: 'video' },
    caption: { type: String, default: '' },
    status: { type: String, enum: ['submitted', 'under_review', 'winner', 'rejected'], default: 'submitted' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Submission', submissionSchema);
