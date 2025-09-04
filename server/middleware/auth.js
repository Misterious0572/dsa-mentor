const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// HTTP middleware
function authenticateToken(req, res, next) {
  const hdr = req.headers.authorization;
  const token = hdr?.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Access token required" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId || decoded.id; // accept either claim
    req.userEmail = decoded.email;
    if (!req.userId) return res.status(401).json({ error: "Invalid token payload" });
    next();
  } catch (e) {
    console.error("Auth middleware error:", e);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Socket.io middleware
async function authenticateSocket(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error: No token provided"));

    const decoded = jwt.verify(token, JWT_SECRET);
    const uid = decoded.userId || decoded.id;
    const user = await User.findById(uid);
    if (!user) return next(new Error("Authentication error: User not found"));

    socket.userId = uid;
    socket.userEmail = decoded.email;
    next();
  } catch (e) {
    console.error("Socket auth error:", e);
    next(new Error("Authentication error: Invalid token"));
  }
}

module.exports = { authenticateToken, authenticateSocket };
