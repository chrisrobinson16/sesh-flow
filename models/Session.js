import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productType: {
    type: String,
    required: true,
  },
  strainType: {
    type: String,
  },
  amount: {
    type: String,
  },
  moodBefore: {
    type: String,
  },
  moodAfter: {
    type: String,
  },
  effects: {
    type: [String],
    default: [],
  },
  rating: {
    type: Number,
  },
  notes: {
    type: String,
  },
  sessionNotes: {
    setting: { type: String },
    experience: { type: String },
    reminder: { type: String },
    additional: { type: String },
  },
  imageUrl: {
    type: String,
  },
  imagePublicId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Session = mongoose.model('Session', sessionSchema)

export default Session
