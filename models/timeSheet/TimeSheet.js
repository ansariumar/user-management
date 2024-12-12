const mongoose = require('mongoose');
const Employee = require('../Employee');


const timesheetSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true }, // Employee ID
    project: { type: String, required: true }, // Project/Client Name
    task: { type: String, required: true }, // Task description
    assignedBy: { type: String, required: true }, // Manager ID
    week: { type: Date, required: true }, // The starting date of the week
    hours: {
        monday: { type: Number, default: 0 },
        tuesday: { type: Number, default: 0 },
        wednesday: { type: Number, default: 0 },
        thursday: { type: Number, default: 0 },
        friday: { type: Number, default: 0 },
        saturday: { type: Number, default: 0 },
        sunday: { type: Number, default: 0 },
    },
}, { timestamps: true });

module.exports = mongoose.model('Timesheet', timesheetSchema);
