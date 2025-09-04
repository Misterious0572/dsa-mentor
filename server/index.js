require('dotenv').config(); 

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const progressRoutes = require("./routes/progress");
const curriculumRoutes = require("./routes/curriculum");
const { authenticateSocket } = require("./middleware/auth");

const app = express();
app.set('trust proxy', 1); // FIX: Add this line to trust Render's proxy

// Security (relax CSP for Vite dev)
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// DYNAMIC CORS ORIGIN (with debugging)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log('--- CORS CHECK ---');
      console.log('Request Origin:', origin);
      console.log('Allowed Frontend URL:', process.env.FRONTEND_URL);
      console.log('Is Origin Allowed?:', allowedOrigins.indexOf(origin) !== -1);
      console.log('--- END CORS CHECK ---');

      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DYNAMIC MONGO CONNECTION
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/dsa-mentor";

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Rate limit ONLY auth routes (not global)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login/register attempts. Try again later." },
});

// ... (The rest of your file is unchanged)
// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/curriculum", curriculumRoutes);

// Error fallback (always JSON)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

// Socket.io (using the same dynamic origin logic)
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { 
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }, 
    methods: ["GET", "POST"] 
  },
});

io.use(authenticateSocket);

io.on("connection", (socket) => {
  console.log(`👤 User connected: ${socket.userId}`);
  socket.join(`user_${socket.userId}`);

  socket.on("progress_update", (data) => {
    socket.to(`user_${socket.userId}`).emit("progress_sync", data);
  });

  socket.on("lesson_complete", (data) => {
    io.to(`user_${socket.userId}`).emit("lesson_completed", {
      day: data.day,
      timestamp: new Date(),
      message: "Outstanding work! You're one step closer to DSA mastery.",
    });
  });

  socket.on("disconnect", () => {
    console.log(`👋 User disconnected: ${socket.userId}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready for real-time connections`);
});