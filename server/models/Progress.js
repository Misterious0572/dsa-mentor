const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  day: {
    type: Number,
    required: true,
    min: 1,
    max: 84
  },
  topic: {
    type: String,
    required: true
  },
  videoWatched: {
    type: Boolean,
    default: false
  },
  problemsCompleted: [{
    problemName: String,
    problemUrl: String,
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: Number, // in minutes
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard']
    }
  }],
  notebookCompleted: {
    type: Boolean,
    default: false
  },
  notebookNotes: {
    type: String,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  timeSpent: {
    type: Number, // total time in minutes
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
progressSchema.index({ userId: 1, day: 1 }, { unique: true });

// Method to mark day as complete
progressSchema.methods.markComplete = function() {
  this.completed = true;
  this.completedAt = new Date();
  
  // Check if all requirements are met
  const allProblemsCompleted = this.problemsCompleted.length >= 2;
  const videoWatched = this.videoWatched;
  const notebookCompleted = this.notebookCompleted;
  
  return allProblemsCompleted && videoWatched && notebookCompleted;
};

module.exports = mongoose.model('Progress', progressSchema);