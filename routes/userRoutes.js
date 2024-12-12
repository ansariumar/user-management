const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, { expiresIn: '5h' })
}

router.get('/', (req, res) => {
    res.json({message: "welcome"})
})

router.post('/register', async (req, res) => {
    const { name, email, password, role }  = req.body;

    let user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({message: 'User already exists'})
    }

    console.log(req.body)
    // if(!['Employee', 'HR', 'Admin'].includes(role)) {
    //     return res.status(400).json({message: 'Invalid role'})
    // }

    try {
        user = await User.create({name, email, password, role});
        const jwtToken = generateToken(user._id);

        res.status(201).json({id: user._id, token: jwtToken})
    } catch (error) {
        console.error(error);
        res.status(500).json({message: error.message})
    }
    
})


router.post('/login', async (req, res) => {
    // console.log(req.body)
    const { email, password } = req.body;

    const user = await User.findOne({ email });
console.log(user)
    lol = await (user.comparePassword(password));

    console.log(lol)

    if (user && await (user.comparePassword(password))) {
        const jwtToken = generateToken(user._id);
        
        res.setHeader('set-cookie', `token=${jwtToken}; HttpOnly; Max-Age=3600; SameSite=None; Secure`);
        res.json({ id: user._id, role: user.role, token: jwtToken });
    } else {
        res.status(401).json({ message: "Invalid credential" });
    }
});


router.get('/users', protect, authorize("Admin"),  async (req, res) => {
    const users = await User.find();
    res.json(users);
})

router.get('/employee', protect, authorize('Employee', 'HR', 'Admin'), (req, res) => {
    res.json({message: "Welcome Employee"})
})


router.get('/hr', protect, authorize('HR', 'Admin'), (req, res) => {
    res.json({ message: 'Welcome HR' });
});
  







module.exports = router;
