import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  currentDay: number;
  preferredLanguage: string;
  completedDays: number[];
  streakCount: number;
  lastActivity: Date;
  totalProblemsSolved: number;
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentDay: {
    type: Number,
    default: 1,
    min: 1,
    max: 84
  },
  preferredLanguage: {
    type: String,
    default: '',
    enum: ['', 'python', 'javascript', 'java', 'cpp', 'csharp', 'go']
  },
  completedDays: {
    type: [Number],
    default: []
  },
  streakCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  totalProblemsSolved: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
progressSchema.index({ userId: 1 });
progressSchema.index({ lastActivity: -1 });

export const Progress = mongoose.model<IProgress>('Progress', progressSchema);