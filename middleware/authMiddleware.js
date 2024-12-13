const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
// Protect routes
const protect = async (req, res, next) => {

  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('-password');   //get the user data but removes the password, req.user will make the user data availavble in the next middleware for the next middleware
    
    try {
      req.emp = await Employee.findOne({ userID: decoded.id });    
    } catch (error) {
      console.log("Doesn't exist in employee");
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// Role-based access
// const authorize = (...roles) => {             //if employee is trying to access the role of admin, the roles = ['Admin'], req.user.role = 'Employee'
//   return (req, res, next) => {

//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ message: 'Access denied' });
//     }
//     next();
//   };
// };
const authorize = (...roles) => {             //if employee is trying to access the role of admin, the roles = ['Admin'], req.user.role = 'Employee'
  return (req, res, next) => {
    // console.debug(roles)
    // console.debug(req.user.role)
    if ( roles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
  }
};

module.exports = { protect, authorize };
