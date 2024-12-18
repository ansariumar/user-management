const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const Leave = require('../models/Leave');
// const User = require('../models/User');
const Employee = require('../models/Employee');

const router = express.Router();

/**
 * @swagger
 * /leave/apply:
 *   post:
 *     summary: Apply for a leave
 *     description: Employees or HR can apply for a leave with the specified details.
 *     tags:
 *       - Leave Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leaveType:
 *                 type: string
 *                 enum: [sick, casual]
 *               from:
 *                 type: string
 *                 format: date
 *               to:
 *                 type: string
 *                 format: date
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Leave application submitted successfully
 *       500:
 *         description: Internal server error
 */

router.post('/apply', protect, authorize('Employee', 'HR'), async (req, res) => {
    try {
        const { leaveType, from, to, reason } = req.body;
        const userId = req.emp._id; // User's ID from token, i.e from the auth middleware

        const fromDate = new Date(from);
        const toDate = new Date(to);

        // Calculate the number of days
        const days = (toDate - fromDate) / (1000 * 60 * 60 * 24) + 1;

        const newLeave = await Leave.create({
            userID: userId,
            leaveType,
            fromDate,
            toDate,
            days,
            reason
        });

        await Employee.findByIdAndUpdate(userId, { $inc: { "leaveBalance.pending": 1 } });

        if (leaveType.toLowerCase() === 'sick') await Employee.findByIdAndUpdate(userId, { $inc: { "leaveBalance.sick": 1 } });
        if (leaveType.toLowerCase() === 'casual') await Employee.findByIdAndUpdate(userId, { $inc: { "leaveBalance.casual": 1 } });


        res.status(201).json({message: `Leave Created ` ,newLeave});
    } catch (err) {
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});


/**
 * @swagger
 * /leave:
 *   get:
 *     summary: Get all leave applications
 *     description: HR or Admin can view all leave applications.
 *     tags:
 *       - Leave Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of leave applications
 *       500:
 *         description: Internal server error
 */
router.get('/', protect, authorize('HR', 'Admin'), async (req, res) => {
    try {
        const leaves = await Leave.find().populate('userID')   //when the userID is populated only name and the departemnt property of the USer data will be shown and _id will be shown by default
        res.status(200).json(leaves);
    } catch (err){
        console.error(err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
})


/**
 * @swagger
 * /leave/my:
 *   get:
 *     summary: Get personal leave applications
 *     description: Employees or HR can view their own leave applications.
 *     tags:
 *       - Leave Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of personal leave applications
 *       500:
 *         description: Internal server error
 */
router.get('/my', protect, authorize('Employee', 'HR'), async (req, res) => {
    // console.log("in my")
    const userID = req.emp._id;

    try {
        const myleaves = await Leave.find({ userID: userID })   //userID property is the reference to User from Leave
        return res.status(200).json(myleaves);
    } catch (err) {
        console.err(err)
        return res.status(500).json({ "error": err.message })
    }
})


/**
 * @swagger
 * /leave/balance:
 *   get:
 *     summary: Get leave balance
 *     description: Retrieve the leave balance for the logged-in user.
 *     tags:
 *       - Leave Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leave balance details
 *       500:
 *         description: Internal server error
 */
router.get('/balance', protect, authorize('Employee', 'HR'), async (req, res) => {
    try {
        const userId = req.emp._id;
        const user = await Employee.findById(userId)

        const data = {
            totalLeaves: user.leaveBalance.pending + user.leaveBalance.approved + user.leaveBalance.rejected,
            approved: user.leaveBalance.approved,
            rejected: user.leaveBalance.rejected,
        }

        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
})


/**
 * @swagger
 * /leave/{id}/status:
 *   put:
 *     summary: Update leave application status
 *     description: HR or Admin can approve or reject leave applications.
 *     tags:
 *       - Leave Management
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
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       203:
 *         description: Leave application status updated
 *       404:
 *         description: Leave application not found
 *       500:
 *         description: Internal server error
 */

router.put("/:id/status", protect, authorize("HR", "Admin"), async (req, res) => {
    const approverID = req.emp._id;

    const { status } = req.body;        //There may be a dropdown a menu on the frontend that will send either "Approved" or "Rejected"

    try {
        let leaveApplication = await Leave.findById(req.params.id);
        if (!leaveApplication) return res.status(404).json({ error: "The Leave Application was not found" });
        leaveApplication.status = status.toLowerCase();
        leaveApplication.approver = approverID;
        leaveApplication = await leaveApplication.save()    //leaveApplication.status is now either "approved" or "rejected"

        console.log(leaveApplication)

        if (leaveApplication.status === "approved") {
            if (leaveApplication.leaveType === "casual") {
                await Employee.findByIdAndUpdate(
                    leaveApplication.userID,
                    {
                      $inc: {
                        "leaveBalance.pending": -1,
                        "leaveBalance.casual": -1,
                        "leaveBalance.approved": 1
                      }
                    }
                  );
            }
            if (leaveApplication.leaveType === 'sick') {
                await Employee.findByIdAndUpdate(leaveApplication.userID,
                    {
                        $inc: {
                            "leaveBalance.pending": -1,
                            "leaveBalance.sick": -1,
                            "leaveBalance.approved": 1
                        }
                    }
                );
            }
        }

        if (leaveApplication.status === 'rejected') {
            console.log("rejection called")
            if (leaveApplication.leaveType === 'casual') {
                console.log("casual called")
                await Employee.findByIdAndUpdate(leaveApplication.userID,
                    {
                        $inc: {
                            "leaveBalance.pending": -1,
                            "leaveBalance.rejected": 1,
                            "leaveBalance.casual": -1
                        }
                    }
                );
            }
            if (leaveApplication.leaveType === 'sick') {
                console.log("sick called")
                await Employee.findByIdAndUpdate(leaveApplication.userID,
                    {
                        $inc: {
                            "leaveBalance.pending": -1,
                            "leaveBalance.rejected": 1,
                            "leaveBalance.sick": 1
                        }
                    }
                );
            }
        }

        return res.status(203).json({ message: `The leave application was ${status}` })
    } catch (err) {
        console.error(err);
        return res.status(500).send({ "error": err.message })
    }
})


/**
 * @swagger
 * /leave/{id}:
 *   delete:
 *     summary: Delete a leave application
 *     description: Admin can delete a leave application.
 *     tags:
 *       - Leave Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Leave application deleted successfully
 *       404:
 *         description: Leave application not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", protect, authorize("Admin"), async (req, res) => {
    try {
        const deletedLeave = await Leave.findByIdAndDelete(req.params.id)
        if (!deletedLeave) return res.status(404).json({ message: "The leave was not found" })

        await updateLeaveForUser(deletedLeave);


        return res.status(204).json({ message: "The Leave Application was deleted" })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: err.message })
    }
})




async function updateLeaveForUser(leave) {
    console.log("inside the funciton")
    try {
        let userID = leave.userID
        const updatedUser = await Employee.findByIdAndUpdate(userID,
            { $inc: { "leaveBalance.pending": -1 } }
        );
        
        if (leave.leaveType === 'casual') {
            await Employee.findByIdAndUpdate(userID,
                { $inc: { "leaveBalance.casual": -1 } },
            );
        }
        if (leave.leaveType === 'sick') {
            await Employee.findByIdAndUpdate(userID,
                { $inc: { "leaveBalance.sick": -1 } },
            );
        }

        return
    } catch (err) {
        console.error(err)
    }

}

module.exports = router;