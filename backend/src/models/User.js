const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    avatarUrl: { type: String, default: null },
    referralCode: { type: String, unique: true, index: true },
  },
  { timestamps: true }
);

userSchema.pre('validate', function assignReferralCode(next) {
  if (!this.referralCode) {
    this.referralCode = crypto.randomBytes(4).toString('hex');
  }
  next();
});

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatarUrl: this.avatarUrl,
    referralCode: this.referralCode,
  };
};

module.exports = mongoose.model('User', userSchema);
