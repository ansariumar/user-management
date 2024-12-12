const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password']
    },
    role: {
        type: String,
        enum: ['Employee', 'HR', 'Admin'],
        default: 'Employee'
    },
    name: { type: String },
    department: { type: String },
    leaveBalance: {
        casual: { type: Number, default: 0 },
        sick: { type: Number, default: 0 },
        pending: { type: Number, default: 0 },
        rejected: { type: Number, default: 0 },
        approved: { type: Number, default: 0 }
    },

}, { timestamps: true })

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


UserSchema.methods.comparePassword = async function (candidatePassword) {
    pass = await bcrypt.compare(candidatePassword, this.password)

    console.log("in the model " + pass)
    return await bcrypt.compare(candidatePassword, this.password);
};



module.exports = mongoose.model('User', UserSchema)