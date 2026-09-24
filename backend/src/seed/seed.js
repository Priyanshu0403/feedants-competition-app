/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const Submission = require('../models/Submission');

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

async function seed() {
  await connectDB();

  console.log('[seed] Clearing existing data...');
  await Promise.all([
    Competition.deleteMany({}),
    Registration.deleteMany({}),
    Submission.deleteMany({}),
    User.deleteMany({}),
  ]);

  console.log('[seed] Creating demo users...');
  const passwordHash = await bcrypt.hash('password123', 10);
  const [registeredUser, freshUser] = await User.create([
    { name: 'Ishita Chopra', email: 'registered@feedants.dev', passwordHash },
    { name: 'Rohan Verma', email: 'new@feedants.dev', passwordHash },
  ]);

  const now = Date.now();

  console.log('[seed] Creating "Feedants Classical Dance" competition (matches the design reference)...');
  const competition = await Competition.create({
    title: 'Feedants Classical Dance',
    slug: 'feedants-classical-dance',
    tags: ['Dance', 'Multi-Win'],
    badges: ['Winners get certificate'],
    category: 'Dance',
    description: {
      about:
        'This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance forms such as Kathak, Bharatanatyam, Odissi and more. Entries are judged on technique, expression and choreography by an experienced panel.',
      judgingParameters:
        'Technique & posture (30%), expression & storytelling (25%), choreography & creativity (25%), costume & presentation (10%), audio-video quality (10%). Each judge scores independently and the average determines the final rank.',
      rulesAndEligibility:
        'Open to all age groups and skill levels. One submission per participant. Submissions must be original performances filmed within the last 6 months, 1-3 minutes long, in any classical Indian dance form. Participants must have a confirmed registration before the submission window closes.',
    },
    bannerImage: null,
    currency: 'INR',
    prizePool: 1500,
    entryFee: 99,
    maxParticipants: 20,
    registeredCount: 0,
    registrationStart: new Date(now - 5 * DAY),
    registrationEnd: new Date(now + 1 * DAY + 6 * HOUR + 28 * 60 * 1000),
    submissionStart: new Date(now - 1 * DAY),
    submissionEnd: new Date(now + 20 * DAY),
    resultDate: new Date(now + 23 * DAY),
    judge: {
      name: 'Manju Dubey',
      title: 'Professional Kathak Dancer',
      bio: '12+ years of experience performing and teaching classical Kathak across India.',
      photoUrl: 'https://i.pravatar.cc/150?img=47',
      introVideoUrl: 'https://example.com/videos/manju-dubey-intro.mp4',
    },
    rewards: [
      { position: 1, label: '1st Winner', amount: 550 },
      { position: 2, label: '2nd Winner', amount: 300 },
      { position: 3, label: '3rd Winner', amount: 240 },
      { position: 4, label: '4th Winner', amount: 200 },
      { position: 5, label: '5th Winner', amount: 130 },
      { position: 6, label: '6th Winner', amount: 80 },
    ],
    previousWinners: [
      { name: 'Riya Shah', position: '1st Winner', thumbnailUrl: 'https://i.pravatar.cc/150?img=32', year: 2025 },
      { name: 'Aarav Mehta', position: '1st Winner', thumbnailUrl: 'https://i.pravatar.cc/150?img=12', year: 2025 },
      { name: 'Neha Verma', position: '2nd Winner', thumbnailUrl: 'https://i.pravatar.cc/150?img=45', year: 2025 },
      { name: 'Ishita Chopra', position: '3rd Winner', thumbnailUrl: 'https://i.pravatar.cc/150?img=48', year: 2025 },
    ],
    refundPolicyText: 'Entry fees are non-refundable once registration is confirmed, except in case of competition cancellation.',
    paymentProvider: 'Razorpay',
    status: 'published',
    createdBy: registeredUser._id,
  });

  console.log('[seed] Creating a second, free competition for list/edge-case variety...');
  await Competition.create({
    title: 'Feedants Singing Stars',
    slug: 'feedants-singing-stars',
    tags: ['Music', 'Solo'],
    badges: [],
    category: 'Music',
    description: {
      about: 'A singing competition for solo vocalists across genres. Free entry, open to all.',
      judgingParameters: 'Pitch accuracy, tone, stage presence and originality.',
      rulesAndEligibility: 'Open to ages 13+. One entry per participant.',
    },
    currency: 'INR',
    prizePool: 3000,
    entryFee: 0,
    maxParticipants: 50,
    registeredCount: 0,
    registrationStart: new Date(now + 2 * DAY),
    registrationEnd: new Date(now + 10 * DAY),
    submissionStart: new Date(now + 10 * DAY),
    submissionEnd: new Date(now + 25 * DAY),
    resultDate: new Date(now + 28 * DAY),
    judge: {
      name: 'Karan Oberoi',
      title: 'Music Director',
      bio: '10+ years composing for independent films.',
      photoUrl: 'https://i.pravatar.cc/150?img=15',
    },
    rewards: [
      { position: 1, label: '1st Winner', amount: 1500 },
      { position: 2, label: '2nd Winner', amount: 900 },
      { position: 3, label: '3rd Winner', amount: 600 },
    ],
    previousWinners: [],
    status: 'published',
    createdBy: registeredUser._id,
  });

  console.log('[seed] Registering demo user "Ishita Chopra" (confirmed) for Classical Dance...');
  await Registration.create({
    competition: competition._id,
    user: registeredUser._id,
    status: 'confirmed',
    entryFeeAmount: competition.entryFee,
    confirmedAt: new Date(now - 4 * DAY),
    paymentReference: 'MOCK-SEED-0001',
  });
  await Competition.updateOne({ _id: competition._id }, { $inc: { registeredCount: 1 } });

  console.log('\n[seed] Done!\n');
  console.log('Demo accounts (password for both: "password123"):');
  console.log('  registered@feedants.dev  -> already registered & confirmed for "Feedants Classical Dance"');
  console.log(`  new@feedants.dev         -> not registered yet, id=${freshUser._id}, exercises the full flow`);
  console.log(`\nCompetition id:   ${competition._id}`);
  console.log(`Competition slug: ${competition.slug}`);

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
