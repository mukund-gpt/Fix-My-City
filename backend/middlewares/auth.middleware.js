import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
    try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    req.user = decoded;  // or fetch user from DB
    next();
    } 
    catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
       
};
export const adminProtect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET); // Use a different secret for admin tokens
            req.admin = decoded; // Attach decoded token payload to request object
        } catch (error) {
            return res.status(401).json({ message: "Invalid admin token" }); // Token verification failed
        }
    } else {
        return res.status(401).json({ message: "No admin token provided" }); // No token found in request
    }
 
};
