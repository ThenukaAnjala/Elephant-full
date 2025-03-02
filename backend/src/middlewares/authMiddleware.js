const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // "Bearer <token>"
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // the part after "Bearer"
  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    // => { id, role, iat, exp }
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token error:", err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
