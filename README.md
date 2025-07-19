# CloudCopy - Google Drive Clone

A full-stack file sharing application with public sharing capabilities, QR code generation, and search functionality.

## Features

### 🔐 Authentication
- Google OAuth via Firebase
- Secure file access with user isolation

### 📁 File Management
- Upload files of any type
- Download files
- View file metadata (name, size, type)

### 🔗 Public File Sharing
- Generate public download links for any file
- Share links with anyone - no authentication required
- Links are secure and unique

### 📱 QR Code Generation
- Generate QR codes for public file links
- Easy mobile access to shared files
- Scan QR codes to download files directly

### 🔍 Search Functionality
- Real-time search by filename
- Search by file type (MIME type)
- Instant filtering of file list

## Tech Stack

### Backend
- **Node.js** with Express
- **MongoDB** for file metadata
- **Firebase Admin** for authentication
- **Multer** for file uploads
- **QRCode** for QR code generation

### Frontend
- **Angular 20** with TypeScript
- **Firebase** for authentication
- **Bootstrap** for UI components
- **QRCode** library for QR generation

## Setup

### Backend Setup
1. Navigate to `backend/` directory
2. Install dependencies: `npm install`
3. Create `.env` file with:
   ```
   MONGO_URI=your_mongodb_connection_string
   GOOGLE_CREDENTIAL_PATH=path_to_firebase_service_account.json
   ```
4. Run the server: `npm start`

### Frontend Setup
1. Navigate to `frontend/` directory
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## API Endpoints

### File Management
- `POST /api/files/upload` - Upload a file (requires auth)
- `GET /api/files/` - List user's files (requires auth)
- `GET /api/files/download/:id` - Download a file (requires auth)

### Public Sharing
- `GET /api/files/public/:publicId` - Download file publicly (no auth)
- `GET /api/files/public-link/:id` - Get public link for file (requires auth)

## Usage

1. **Login**: Click "Login with Google" to authenticate
2. **Upload**: Select a file and click "Upload"
3. **Search**: Use the search bar to filter files by name or type
4. **Share**: Click "Share Link" to copy a public download link
5. **QR Code**: Click "QR Code" to generate a scannable QR code
6. **Download**: Click "Download" to download files

## Security Features

- All file operations require Firebase authentication
- Public links use unique, unguessable IDs
- Files are isolated by user ID
- Secure token verification on all protected routes

## File Structure

```
CloudCopy/
├── backend/
│   ├── models/File.js          # MongoDB file schema
│   ├── routes/fileRoutes.js    # API endpoints
│   ├── middleware/firebaseAuth.js # Auth middleware
│   └── server.js              # Express server
├── frontend/
│   └── src/app/file-upload/   # Main component
└── uploads/                   # File storage
``` 