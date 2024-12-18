const express = require('express');
const Employee = require('../models/Employee');
const Shift = require('../models/Shift');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();
 
/**
 * @swagger
 * /shift/my:
 *   get:
 *     summary: Get logged-in employee's shifts
 *     description: Fetch all shifts assigned to the currently logged-in employee.
 *     tags:
 *       - Shift Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of shifts for the employee
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /shift:
 *   post:
 *     summary: Add a new shift
 *     description: Create a new shift with specified details.
 *     tags:
 *       - Shift Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               shiftType:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Shift created successfully
 *       400:
 *         description: Bad request or shift already exists
 *       500:
 *         description: Server error
 */
router.post('/', protect, authorize("HR", "Admin"), async (req, res) => {
    const { date, startTime, endTime, shiftType, notes } = req.body;

    const checkShift = await Shift.findOne({ date, startTime, endTime });
    if (checkShift) return res.status(400).json({ error: 'Shift already exists' });

    if (!date || !startTime || !endTime || !shiftType) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    try {
        const shift = await Shift.create({ date, startTime, endTime, shiftType, notes });

        res.status(201).json({message:"Shift created", shift });
    } catch (error) {
        console.err(error)
        res.status(500).json({ error: 'Server error' });
    }
})

/**
 * @swagger
 * /shift:
 *   get:
 *     summary: Get all shifts
 *     description: Retrieve all shifts in the system.
 *     tags:
 *       - Shift Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all shifts
 *       500:
 *         description: Internal server error
 */
router.get('/', protect, authorize("HR", "Admin"), async (req, res) => {
    try {
        const shifts = await Shift.find();

        res.status(200).json({ shifts });
    } catch (error) {
        console.err(error)
        res.status(500).json({ error: 'Server error' });
    }
})



/**
 * @swagger
 * /shift/{id}:
 *   get:
 *     summary: Get a specific shift by ID
 *     description: Fetch details of a shift by its ID.
 *     tags:
 *       - Shift Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shift details
 *       404:
 *         description: Shift not found
 *       500:
 *         description: Server error
 */
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



/**
 * @swagger
 * /shift/{id}:
 *   put:
 *     summary: Update a shift
 *     description: Modify an existing shift by its ID.
 *     tags:
 *       - Shift Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               shiftType:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Shift updated successfully
 *       404:
 *         description: Shift not found
 *       500:
 *         description: Server error
 */
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



/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete a shift
 *     description: Remove a shift from the system by its ID.
 *     tags:
 *       - Shift Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shift deleted successfully
 *       404:
 *         description: Shift not found
 *       500:
 *         description: Server error
 */
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