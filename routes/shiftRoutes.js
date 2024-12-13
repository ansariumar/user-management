const express = require('express');
const Employee = require('../models/Employee');
const Shift = require('../models/Shift');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();


router.get('/my', protect, authorize("Employee"), async (req, res) => {
    try {
        
        

        if (!req.emp) return res.status(404).json({ error: "Employee not found" });

        const employee = req.emp;
        let shift = await employee.populate('shifts', 'date startTime endTime shiftType notes')
        shift = shift.shifts;
        return res.status(200).json(shift);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
})

// Add a shift
router.post('/', protect, authorize("HR", "Admin"), async (req, res) => {
    const { date, startTime, endTime, shiftType, notes } = req.body;

    const checkShift = await Shift.findOne({ date, startTime, endTime });
    if (checkShift) return res.status(400).json({ error: 'Shift already exists' });

    if (!date || !startTime || !endTime || !shiftType) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    try {
        const shift = await Shift.create({ date, startTime, endTime, shiftType, notes });

        res.status(201).json({ shift });
    } catch (error) {
        console.err(error)
        res.status(500).json({ error: 'Server error' });
    }
})

// Get all the shifts
router.get('/', protect, authorize("HR", "Admin"), async (req, res) => {
    try {
        const shifts = await Shift.find();

        res.status(200).json({ shifts });
    } catch (error) {
        console.err(error)
        res.status(500).json({ error: 'Server error' });
    }
})

// Get a single shift by ID
router.get('/:id', protect, authorize("HR", "Admin"), async (req, res) => {
    try {
        const shift = await Shift.findById(req.params.id);

        if (!shift) {
            return res.status(404).json({ error: 'Shift not found' });
        }

        res.status(200).json({ shift });
    } catch (error) {
        console.err(error)
        res.status(500).json({ error: 'Server error' });
    }
})

// Update a shift
router.put('/:id', protect, authorize("HR", "Admin"), async (req, res) => {
    try {
        const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!shift) return res.status(404).json({ error: 'Shift not found' });

        return res.status(200).json({ message: "Shift updated successfully", shift });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
})

// Delete a shift
router.delete('/:id', protect, authorize("HR", "Admin"), async (req, res) => {
    try {
        const shift = await Shift.findByIdAndDelete(req.params.id);

        if (!shift) return res.status(404).json({ error: 'Shift not found' });

        return res.status(200).json({ message: "Shift deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
})



module.exports = router;