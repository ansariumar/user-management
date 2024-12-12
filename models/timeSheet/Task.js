const mongoose = require('mongoose');
const Employee = require('../Employee');

const taskSchema = new mongoose.Schema({
    project: { type: String, required: true }, // Project name
    title: { type: String, required: true }, // Task title
    description: { type: String }, // Task description
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true }, // Employee ID
    status: { type: String, enum: ['todo', 'in progress', 'done'], default: 'todo', trim: true, lowercase: true }, // Current task status
    dueDate: { type: Date }, // Due date for the task
    priority: { type: String, enum: ['low', 'high'], default: 'low', trim: true, lowercase: true }, // Task priority
  }, { timestamps: true });
  
  module.exports = mongoose.model('Task', taskSchema);
  