const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    position: { type: Number, required: true },
    label: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const winnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    thumbnailUrl: { type: String },
    videoUrl: { type: String },
    year: { type: Number },
  },
  { _id: false }
);

const judgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String },
    bio: { type: String },
    photoUrl: { type: String },
    introVideoUrl: { type: String },
  },
  { _id: false }
);

const competitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true, trim: true },
    tags: { type: [String], default: [] },
    badges: { type: [String], default: [] },
    category: { type: String, default: 'General' },

    description: {
      about: { type: String, default: '' },
      judgingParameters: { type: String, default: '' },
      rulesAndEligibility: { type: String, default: '' },
    },

    bannerImage: { type: String, default: null },
    currency: { type: String, default: 'INR' },
    prizePool: { type: Number, required: true, min: 0 },
    entryFee: { type: Number, required: true, min: 0, default: 0 },

    maxParticipants: { type: Number, required: true, min: 1 },
    // Denormalized counter, kept consistent via atomic $inc operations only
    // (never read-modify-write from application code) — see
    // registrationService.registerUserForCompetition for why.
    registeredCount: { type: Number, default: 0, min: 0 },

    registrationStart: { type: Date, required: true },
    registrationEnd: { type: Date, required: true },
    submissionStart: { type: Date, required: true },
    submissionEnd: { type: Date, required: true },
    resultDate: { type: Date, required: true },

    judge: { type: judgeSchema, required: true },
    rewards: { type: [rewardSchema], default: [] },
    previousWinners: { type: [winnerSchema], default: [] },

    refundPolicyText: {
      type: String,
      default: 'Entry fees are non-refundable once registration is confirmed, except in case of competition cancellation.',
    },
    paymentProvider: { type: String, default: 'Razorpay' },

    status: { type: String, enum: ['draft', 'published', 'cancelled'], default: 'draft', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Supports the common "published competitions sorted by closing soonest" query.
competitionSchema.index({ status: 1, registrationEnd: 1 });

competitionSchema.pre('validate', function checkDateOrder(next) {
  if (this.registrationStart && this.registrationEnd && this.registrationStart >= this.registrationEnd) {
    return next(new Error('registrationStart must be before registrationEnd'));
  }
  if (this.submissionStart && this.submissionEnd && this.submissionStart >= this.submissionEnd) {
    return next(new Error('submissionStart must be before submissionEnd'));
  }
  if (this.resultDate && this.submissionEnd && this.resultDate < this.submissionEnd) {
    return next(new Error('resultDate should not be before submissionEnd'));
  }
  next();
});

module.exports = mongoose.model('Competition', competitionSchema);
