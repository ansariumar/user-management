const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const Leave = require('../models/Leave');
const User = require('../models/User');

const router = express.Router();


router.post('/apply', protect, authorize('Employee', 'HR'), async (req, res) => {
    try {
        const { leaveType, from, to, reason } = req.body;
        const userId = req.user._id; // User's ID from token, i.e from the auth middleware

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
            reason,
            status: 'Pending',
        });

        await User.findByIdAndUpdate(userId, { $inc: { "leaveBalance.pending": 1 } });

        if (leaveType.toLowerCase() === 'sick') await User.findByIdAndUpdate(userId, { $inc: { "leaveBalance.sick": 1 } });
        if (leaveType.toLowerCase() === 'casual') await User.findByIdAndUpdate(userId, { $inc: { "leaveBalance.casual": 1 } });


        res.status(201).json(newLeave);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

router.get('/', protect, authorize('HR', 'Admin'), async (req, res) => {
    try {
        const leaves = await Leave.find().populate('userID', 'name department');     //when the userID is populated only name and the departemnt property of the USer data will be shown and _id will be shown by default
        res.status(200).json(leaves);
    } catch {
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
})

router.get('/my', protect, authorize('Employee', 'HR'), async (req, res) => {
    // console.log("in my")
    const userID = req.user._id;

    try {
        const myleaves = await Leave.find({ userID: userID })   //userID property is the reference to User from Leave
        return res.status(200).json(myleaves);
    } catch (err) {
        console.err(err)
        return res.status(500).json({ "error": err.message })
    }
})

router.get('/balance', protect, authorize('Employee', 'HR'), async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId)

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

router.put("/:id/status", protect, authorize("HR", "Admin"), async (req, res) => {
    const approverID = req.user._id;

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
                await User.findByIdAndUpdate(
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
                await User.findByIdAndUpdate(leaveApplication.userID,
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
                await User.findByIdAndUpdate(leaveApplication.userID,
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
                await User.findByIdAndUpdate(leaveApplication.userID,
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

router.delete("/:id", protect, authorize("Admin"), async (req, res) => {
    try {
        const deletedLeave = await Leave.findByIdAndDelete(req.params.id)
        if (!deletedLeave) return res.status(404).json({ message: "The leave was not found" })

        // let userWhoseLeaveWasDeleted = deletedLeave.userID
        // userWhoseLeaveWasDeleted = await User.findByIdAndUpdate(userWhoseLeaveWasDeleted,
        //     { $inc: { "leaveBalance.pending": -1 } }
        // );

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
        const updatedUser = await User.findByIdAndUpdate(userID,
            { $inc: { "leaveBalance.pending": -1 } }
        );
        
        if (leave.leaveType === 'casual') {
            await User.findByIdAndUpdate(userID,
                { $inc: { "leaveBalance.casual": -1 } },
            );
        }
        if (leave.leaveType === 'sick') {
            await User.findByIdAndUpdate(userID,
                { $inc: { "leaveBalance.sick": -1 } },
            );
        }

        return
    } catch (err) {
        console.error(err)
    }

}

module.exports = router;