# DSA Mentor - Real-time Learning Platform

A comprehensive 12-week Data Structures and Algorithms mentorship platform with real-time progress tracking, multi-factor authentication, and cross-device synchronization.

## Features

### 🎯 Core Learning Experience
- **84-Day Structured Curriculum**: Complete 12-week program from beginner to intermediate
- **Tough Love Coaching**: Demanding but motivational mentor persona
- **Multi-Language Support**: JavaScript, Python, Java, C++, TypeScript, Go, Rust
- **Real-time Progress Tracking**: Live synchronization across all devices

### 🔒 Security & Authentication
- **Multi-Factor Authentication (MFA)**: TOTP-based security with QR code setup
- **JWT Token Authentication**: Secure session management
- **Password Hashing**: bcrypt with salt rounds for maximum security
- **Rate Limiting**: Protection against brute force attacks

### 📱 Cross-Platform Compatibility
- **Progressive Web App**: Install on any device (Windows, macOS, iOS, Android)
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Real-time Sync**: WebSocket connections for instant updates
- **Offline Capability**: Local MongoDB for accessibility

### 📊 Progress Management
- **Daily Lesson Tracking**: Video completion, problem solving, notebook notes
- **Streak Counters**: Motivation through consistency tracking
- **Performance Analytics**: Weekly progress charts and statistics
- **Achievement System**: Milestone celebrations and motivational feedback

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **React Router** for navigation
- **Socket.io Client** for real-time communication
- **Recharts** for progress visualization
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **Tailwind CSS** for styling

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **JWT** for authentication
- **bcrypt** for password hashing
- **Speakeasy** for MFA/TOTP
- **QRCode** generation for MFA setup
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Rate Limiting** for API protection

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

3. **Run the Application**
   ```bash
   npm run dev
   ```

This will start both the frontend (port 5173) and backend (port 3001) concurrently.

### First Time Setup

1. **Create Account**: Register with email, password, name, and preferred programming language
2. **Enable MFA** (Optional but Recommended): Set up two-factor authentication for enhanced security
3. **Begin Journey**: Start with Day 1 of the 84-day curriculum

## Architecture

### Real-time Communication
- WebSocket connections for instant progress synchronization
- Cross-device notifications and updates
- Live coaching feedback and motivational messages

### Database Schema
- **Users**: Authentication, preferences, progress tracking
- **Progress**: Daily completion status, problem solutions, notes
- **Sessions**: Real-time connection management

### Security Features
- Password hashing with bcrypt (12 salt rounds)
- JWT tokens with 7-day expiration
- MFA with TOTP (Time-based One-Time Password)
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Security headers with Helmet

## Curriculum Structure

### Phase 1: Foundations (Days 1-14)
Arrays, Strings, Complexity Analysis, Standard Library

### Phase 2: Patterns & Techniques (Days 15-35)
Two Pointers, Hashing, Sorting, Binary Search, Sliding Window, Recursion

### Phase 3: Core Data Structures (Days 36-63)
Linked Lists, Stacks, Queues, Trees, Heaps, Backtracking

### Phase 4: Advanced Topics (Days 64-84)
Graphs, Dynamic Programming, Greedy Algorithms, System Design

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/setup-mfa` - Setup MFA
- `POST /api/auth/verify-mfa` - Verify MFA

### Progress Tracking
- `GET /api/progress` - Get all progress
- `GET /api/progress/day/:day` - Get specific day progress
- `PUT /api/progress/day/:day` - Update day progress
- `POST /api/progress/day/:day/problem` - Mark problem complete
- `GET /api/progress/stats` - Get progress statistics

### Curriculum
- `GET /api/curriculum/day/:day` - Get day curriculum
- `GET /api/curriculum/overview` - Get full curriculum

## Development

### Running in Development Mode
```bash
npm run dev          # Start both frontend and backend
npm run client       # Start only frontend (port 5173)
npm run server       # Start only backend (port 3001)
```

### Building for Production
```bash
npm run build
```

## Contributing

This is a comprehensive learning platform designed to provide the most effective DSA education experience. The tough love coaching approach is intentional and designed to build discipline and confidence through structured challenges.

## License

MIT License - Feel free to use this platform for your own DSA learning journey.