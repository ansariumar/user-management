const mongoose = require('mongoose');
const Employee = require('./Employee');

const shiftSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // Use "HH:mm A" format (e.g., "7:00 pm")
    required: true
  },
  endTime: {
    type: String, // Use "HH:mm A" format
    required: true
  },
  shiftType: {
    type: String, // Example: "Morning Shift", "Night Shift"
    required: true,
    lowercase: true
  },
  notes: {
    type: String, // Example: "Holiday", additional info
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Shift', shiftSchema);
