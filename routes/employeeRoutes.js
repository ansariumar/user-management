const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/addEmp', protect, authorize("HR", "Admin"), async (req, res) => {
    // const userID = req.user._id;

    const { name, email, phone, designation, department, salary, dateOfJoining, address, profileImage, referCode } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(404).json({ error: "User with this email does not exist" });
    }
    const empUserID = user._id;

    try {
        const empData = {
            name,
            email,
            userID: empUserID,
            phone,
            designation,
            department,
            salary,
            dateOfJoining,
            address,
            profileImage,
            referCode
        };

        const newEmp = await Employee.create(empData);
        console.log(newEmp);
        return res.status(201).json(newEmp.populate('userID'));

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Server error" });
    }
})

router.get('/getEmp', async (req, res) => {
    const employees = await Employee.find({ name: "umar" }).populate({ path: "userID", select: "-password" }).select("-userID.password");
    res.json(employees);
})

module.exports = router;