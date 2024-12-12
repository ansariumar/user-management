const mongoose = require('mongoose');
const User = require('../User');

const scheduleSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Employee ID
    date: { type: Date, required: true }, // Date of the task
    task: { type: String, required: true }, // Task description
    duration: { type: Number, required: true }, // Duration of task in hours
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);

// THE SCHEDULE ROUTE IS TODO