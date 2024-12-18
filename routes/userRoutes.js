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


/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns a JWT token if the credentials are valid.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *     responses:
 *       200:
 *         description: User successfully authenticated
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only cookie containing the JWT token
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: User ID
 *                 role:
 *                   type: string
 *                   description: User role
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credential
 *       500:
 *         description: Internal server error
 */

router.post('/login', async (req, res) => {

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









module.exports = router;
