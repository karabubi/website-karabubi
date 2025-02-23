// const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {
//   const token = req.header('Authorization');
//   if (!token) return res.status(401).json({ error: 'Access denied' });

//   try {
//     const verified = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = verified;
//     next();
//   } catch (error) {
//     res.status(400).json({ error: 'Invalid token' });
//   }
// };




const authMiddleware = (req, res, next) => {
  // Simulate authentication check (replace with actual logic, e.g., JWT verification)
  const isAuthenticated = true; // For demonstration purposes

  if (isAuthenticated) {
    next(); // Allow access to the next middleware/route
  } else {
    res.status(401).json({ message: "Unauthorized" }); // Deny access
  }
};

module.exports = authMiddleware;