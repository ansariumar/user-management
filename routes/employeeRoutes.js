const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');
const Shift = require('../models/Shift');
const { sendEmail } = require('../utils/mail');

const router = express.Router();

router.post('/addEmp',  async (req, res) => {
    // const userID = req.user._id;

    const { name, email, phone, designation, department, salary, dateOfJoining, address, profileImage, referCode, password, role } = req.body;

    try {
        const { user, err } = await registerUser(email, password, role)
        if (err) throw err.message;
        console.log(user);
        const empUserID = user._id;         //There is a seperate database collection for the employees email and password, to connect with it this line is required

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
            referCode,
            role
        };

        const newEmp = await Employee.create(empData);
        const populatedData = await newEmp.populate('userID');
        if (!newEmp) return res.status(400).json({ error: "Could not create employee" });

        const info = await sendEmail(email, password, name);
        return res.status(201).json({"mail-status": info, populatedData});

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
})

async function registerUser(email, password, role) {
    try {
        const user  = await User.create({email, password, role});
        return {  user, err: null };
    } catch (err) {
        console.error(err);
        return { user: null, err };
    }

}

router.get('/getEmp', async (req, res) => {
    const employees = await Employee.find({ name: "umar" }).populate({ path: "userID", select: "-password" }).select("-userID.password");
    res.json(employees);
})

router.put('/updateShift/:id', protect, authorize("HR", "Admin"), async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ error: "Employee not found" });

        let {  date, shift } = req.body;

        date = new Date(date);
        shift = shift.toLowerCase();

        const shiftData = await Shift.findOne({ date: date, shiftType: shift });
        if (!shiftData) {
            return res.status(404).json({ error: "Shift not found" });
        }
        
        employee.shifts.push(shiftData._id);

        const updatedEmp = await employee.save();

        return res.status(200).json(await updatedEmp.populate('shifts', 'shiftType date'));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
})

router.get('/getShiftFromDate/:date', protect, authorize("HR", "Admin"), async (req, res) => {
    try {
        const date = new Date(req.params.date);
        const shifts = await getShiftFromDate("2023-10-02");

        if (!shifts) return res.status(404).json({ error: "No shifts found" });

        return res.status(200).json(shifts);
    }catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
})

async function getShiftFromDate(date) {
    try {
        const shifts = await Shift.find({ date: date }).select("shiftType");
        if (shifts.length == 0) return null;
        return shifts;
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function createEmployee(email) {

}
module.exports = router;