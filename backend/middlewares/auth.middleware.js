import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; 
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 
            req.user = decoded; // Attach decoded token payload to request object
            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            res.status(401).json({ message: "Invalid token" }); // Token verification failed
        }
    } else {
        res.status(401).json({ message: "No token provided" }); // No token found in request
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
