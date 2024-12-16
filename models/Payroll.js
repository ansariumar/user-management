const mongoose = require('mongoose');
const Employee = require('./Employee');

const payrollSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    month: {
        type: String,
        required: true
    },
    doj: {
        type: Date,
        required: true
    },
    totalWorkinDays: {
        type: Number,
        required: true
    },
    attendanceDays: {
        type: Number,
        required: true
    },
    income: {
        basicSalary: { type:Number, required: true },
        dearnessAllowance: { type:Number, required: true },
        HRA: { type:Number, required: true },
        TiffinAllowance: { type:Number, required: true },
        cityCompensatoryAllowance: { type:Number, required: true },
        medicalAllowance: { type:Number, required: true },
    },
    deductions: {
        pf: { type: Number, required: true },
        professionalTax: { type: Number, required: true },
        TDS: { type: Number, required: true }
    },
    netSalary: {
        type: Number,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model("Payroll", payrollSchema);