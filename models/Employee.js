const mongoose = require('mongoose');
const User = require('./User');
const Shift = require('./Shift');
const Payroll = require('./Payroll')


const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  shifts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift'
  }],
  payrolls: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payroll"
  }],
  leaveBalance: {
    casual: { type: Number, default: 0 },
    sick: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 },
    approved: { type: Number, default: 0 }
},
  salary: {
    type: Number,
    required: true
  },
  dateOfJoining: {
    type: Date,
    default: Date.now
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  profileImage: {
    type: String, // URL or file path to the profile image
  },
  referCode: {
    type: String, // Unique code for referrals
    sparse: true
  }

}, { timestamps: true }); // Automatically add createdAt and updatedAt

module.exports = mongoose.model('Employee', employeeSchema); 
