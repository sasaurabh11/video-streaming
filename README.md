# Video Streaming Platform

A full-stack video streaming application with real-time processing, content moderation, and role-based access control. Built with Node.js, React, and MongoDB.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)


## ✨ Features

### Core Functionality
- **Video Upload**: Upload videos with progress tracking
- **Real-Time Processing**: Live progress updates via WebSocket (Socket.IO)
- **Video Streaming**: HTTP Range Request support for efficient video playback
- **Content Moderation**: Sensitivity analysis for uploaded videos
- **Thumbnail Generation**: Automatic thumbnail creation
- **Video Compression**: Optimized video encoding

### User Management
- **Role-Based Access Control (RBAC)**: Admin, Editor, and Viewer roles
- **User Authentication**: JWT-based authentication
- **Organization Support**: Multi-tenant organization support
- **Video Assignment**: Assign videos to specific viewers

### Advanced Features
- **Advanced Filtering**: Filter by status, sensitivity, date, size, duration
- **Search Functionality**: Search videos by title and description
- **Pagination**: Efficient video list pagination
- **Real-Time Updates**: Live processing progress with Socket.IO
- **Admin Panel**: User management and role assignment

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time communication
- **FFmpeg** - Video processing
- **JWT** - Authentication
- **Multer** - File upload handling

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Socket.IO Client** - Real-time updates
- **Lucide React** - Icons

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher) - Running locally or MongoDB Atlas
- **FFmpeg** - For video processing (included via `ffmpeg-static`)
- **npm** or **yarn** - Package manager

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/sasaurabh11/video-streaming.git
cd video-streaming-platform
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Set Up Environment Variables

#### Backend (.env)

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/videostream
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/videostream

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)

Create a `.env` file in the `frontend` directory:

```env
VITE_BACKEND_URL=http://localhost:5000
```

## ⚙️ Configuration

### MongoDB Setup

1. **Local MongoDB**:
   ```bash
   # Start MongoDB service
   mongod
   ```

2. **MongoDB Atlas** (Cloud):
   - Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a cluster
   - Get connection string
   - Update `MONGODB_URI` in backend `.env`

### File Storage

Videos are stored in:
- `backend/uploads/` - Original uploaded videos
- `backend/processed/` - Processed videos and thumbnails
- `backend/temp/` - Temporary files (auto-cleaned)

Ensure these directories have write permissions.

## 🎯 Usage

### Development Mode

#### Start Backend

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

#### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

### Production Mode

#### Build Frontend

```bash
cd frontend
npm run build
```

#### Start Backend (Production)

```bash
cd backend
npm start
```
## 🏗 Architecture

### Project Structure

```
video-streaming-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   │   ├── database.js  # MongoDB connection
│   │   │   └── multer.js    # File upload config
│   │   ├── controllers/     # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   └── videoController.js
│   │   ├── middleware/      # Express middleware
│   │   │   ├── auth.js     # JWT authentication
│   │   │   ├── errorHandler.js
│   │   │   └── rbac.js     # Role-based access control
│   │   ├── models/          # Mongoose models
│   │   │   ├── User.js
│   │   │   └── Video.js
│   │   ├── routes/          # API routes
│   │   │   ├── auth.js
│   │   │   ├── user.js
│   │   │   └── video.js
│   │   ├── services/        # Business logic
│   │   │   ├── sensitivityAnalyzer.js
│   │   │   └── videoProcessor.js
│   │   ├── socket/          # Socket.IO handlers
│   │   │   └── socketHandler.js
│   │   └── server.js        # Entry point
│   ├── uploads/            # Original videos
│   ├── processed/          # Processed videos & thumbnails
│   └── temp/               # Temporary files
│
└── frontend/
    ├── src/
    │   ├── api/            # API client
    │   │   ├── index.js
    │   │   └── socket.js
    │   ├── components/      # React components
    │   │   ├── admin/
    │   │   ├── auth/
    │   │   ├── layout/
    │   │   └── videos/
    │   ├── context/         # React context
    │   │   └── AuthContext.jsx
    │   ├── App.jsx
    │   └── main.jsx
    └── public/
```

### Data Flow

1. **Video Upload**:
   - User uploads video → Multer saves to `uploads/`
   - Video record created in MongoDB
   - Background processing starts

2. **Video Processing**:
   - Extract metadata
   - Generate thumbnail
   - Compress video
   - Analyze sensitivity
   - Emit progress via Socket.IO

3. **Video Streaming**:
   - Browser requests video with Range header
   - Server responds with 206 Partial Content
   - Streams requested byte range

### Real-Time Updates

- **Socket.IO Rooms**: Each user joins a room with their user ID
- **Progress Events**: `processing:progress` event with video ID and progress
- **Error Events**: `processing:error` event on failure

## 👥 User Roles

### Admin
- Full access to all features
- User management
- Can view/edit/delete all videos
- Access to admin panel

### Editor
- Upload videos
- Edit/delete own videos
- Assign videos to viewers
- View own videos

### Viewer
- View assigned videos
- View public videos
- Cannot upload or edit

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs for password security
- **Role-Based Access**: Middleware-based authorization
- **File Validation**: Multer file type/size validation
- **CORS Protection**: Configured CORS policies
- **Input Validation**: Request validation middleware

## 📝 Environment Variables Reference

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | Backend API URL | `http://localhost:5000` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👤 Author

**Saurabh**

---

**Made with ❤️ for video streaming**

