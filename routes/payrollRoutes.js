const express = require('express');
const Employee = require('../models/Employee');
const Shift = require('../models/Shift');
const { protect, authorize } = require('../middleware/authMiddleware');
const Payroll = require('../models/Payroll');

const router = express.Router;

// router.post("/generate", protect, authorize("Admin", "HR"), async (req, res) => {
//     const { employeeID, month, doj, totalWorkinDays, attendanceDays, income, deductions } = req.body;
//     try {
//         const emp = await Employee.findById(employeeID);
//         if (!emp) return res.status(404).json({ message: "Employee not found" });

        
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server Error" });
//     }
// } )


module.exports = router;