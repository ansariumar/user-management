const mongoose = require('mongoose');
const Employee = require('../models/Employee');

const LeaveSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    leaveType: {
        type: String,
        enum: ['casual', 'sick'],
        lowercase: true,
        required: true
    },
    fromDate: {
        type: Date,
        required: true
    },
    toDate: {
        type: Date,
        required: true
    },
    days: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    approver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        lowercase: true
    },
    appliedDate: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Leave', LeaveSchema);