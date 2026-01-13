# How to Start the Backend Server

## Quick Start

1. **Open a terminal/command prompt**

2. **Navigate to the backend directory:**
   ```bash
   cd career-line-coaching/backend
   ```

3. **Install dependencies (if not already installed):**
   ```bash
   npm install
   ```

4. **Make sure MongoDB is running:**
   - Option 1: Install and run MongoDB locally on port 27017
   - Option 2: Use MongoDB Atlas (cloud) and set MONGODB_URI in .env file

5. **Start the server:**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

6. **You should see:**
   ```
   ✅ MongoDB Connected Successfully
   🚀 Server running on port 5000
   📡 API URL: http://localhost:5000
   ✅ Server is ready to accept requests
   ```

7. **Keep this terminal open** - the server must be running for the frontend to work!

## Troubleshooting

### If you see "Cannot connect to server" error:
- Make sure the backend server is running (step 5)
- Check that it's running on port 5000
- Verify MongoDB is running

### If MongoDB connection fails:
- Make sure MongoDB is installed and running
- Or create a `.env` file in the backend directory with:
  ```
  MONGODB_URI=your_mongodb_connection_string
  ```

### To test if server is running:
- Open browser and go to: http://localhost:5000
- You should see: `{"message":"Career Line API is running","status":"active",...}`

