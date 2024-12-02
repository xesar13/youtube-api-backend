const jwt = require('jsonwebtoken');

class JSONGenerate {
    constructor() {
        if (!JSONGenerate.instance) {
            JSONGenerate.instance = this;
        }
        return JSONGenerate.instance;
    }
generateToken(req, res) {
// Secret key to sign the JWT (keep this private)
const secretKey = 'yoursecretkey';

// Payload - data to encode in the token
const payload = {
  userId: 123,
  username: 'john_doe',
  role: 'admin'
};

// Options for the JWT (e.g., expiration time)
const options = {
  expiresIn: '1h'  // Token will expire in 1 hour
};

// Generate the token
const token = jwt.sign(payload, secretKey, options);
return token;
    }
// Middleware to check for a valid JWT
 authenticateJWT  (req, res, next){
    const token = req.header('Authorization')?.split(' ')[1]; // Extract token from Authorization header
    const secretKey = 'yoursecretkey';

    if (!token) {
      return res.status(403).json({ message: 'Token is required' });
    }
  
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      req.user = decoded; // Add decoded payload to request
      next();
    });
  };
}
module.exports = new JSONGenerate();