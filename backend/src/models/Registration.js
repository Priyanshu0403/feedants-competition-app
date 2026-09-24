const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    competition: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'cancelled', 'expired'],
      default: 'pending_payment',
      index: true,
    },
    entryFeeAmount: { type: Number, required: true, min: 0 },
    paymentReference: { type: String, default: null },
    // Only set for paid competitions: the reserved spot is released back to
    // the pool if payment isn't confirmed before this time.
    paymentExpiresAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// A user may only hold ONE active (pending or confirmed) registration per
// competition at a time. Using a *partial* unique index (rather than a
// plain unique index) means it still allows a user to have several
// cancelled/expired historical registrations and to register again after
// an earlier attempt lapsed.
registrationSchema.index(
  { competition: 1, user: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending_payment', 'confirmed'] } } }
);

module.exports = mongoose.model('Registration', registrationSchema);
