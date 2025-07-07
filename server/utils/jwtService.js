const jwt = require('jsonwebtoken');

class JWTService {
  generateToken(userId, keepLoggedIn = false) {
    const payload = {
      userId,
      iat: Math.floor(Date.now() / 1000),
    };

    const expiresIn = keepLoggedIn ? '30d' : process.env.JWT_EXPIRES_IN || '7d';
    
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return { valid: true, decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

module.exports = new JWTService(); 