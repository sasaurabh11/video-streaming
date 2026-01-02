# Complete Testing Guide - Video Streaming Application

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Test User Accounts Setup](#test-user-accounts-setup)
3. [Testing Flow](#testing-flow)
4. [Feature-by-Feature Testing](#feature-by-feature-testing)
5. [Edge Cases & Error Handling](#edge-cases--error-handling)

---

## Prerequisites

### 1. Start the Application
```bash
# Terminal 1: Start Backend
cd backend
npm install
npm start
# Should run on http://localhost:5000

# Terminal 2: Start Frontend
cd frontend
npm install
npm run dev
# Should run on http://localhost:5173
```

### 2. Verify Services
- ✅ Backend API: `http://localhost:5000/api/health` should return `{"status":"ok"}`
- ✅ Frontend: Open `http://localhost:5173` in browser
- ✅ Database: MongoDB should be running and connected
- ✅ FFmpeg: Should be installed (for video processing)

### 3. Open Browser Developer Tools
- **Chrome/Edge**: F12 or Right-click → Inspect
- **Firefox**: F12
- Enable:
  - **Network Tab**: To see HTTP requests
  - **Console Tab**: To see errors/logs
  - **Application Tab**: To check localStorage (tokens)

---

## Test User Accounts Setup

### Create Test Users (via Registration)

You need to create **3 users** with different roles:

| Username | Email | Password | Role | Organization |
|-----------|-------|----------|------|--------------|
| `admin1` | admin1@test.com | password123 | admin | TestOrg |
| `editor1` | editor1@test.com | password123 | editor | TestOrg |
| `viewer1` | viewer1@test.com | password123 | viewer | TestOrg |

**Note**: First registered user typically becomes admin, or you can change roles via Admin Panel.

---

## Testing Flow

### Phase 1: Authentication & Access Control
### Phase 2: Video Upload & Processing
### Phase 3: Video Streaming & Playback
### Phase 4: Video Management
### Phase 5: Advanced Features
### Phase 6: Admin Functions
### Phase 7: Edge Cases

---

## Feature-by-Feature Testing

---

## 🔐 PHASE 1: Authentication & Access Control

### Test 1.1: User Registration

**Steps:**
1. Open `http://localhost:5173`
2. Click "Register" or navigate to registration page
3. Fill in form:
   - Username: `admin1`
   - Email: `admin1@test.com`
   - Password: `password123`
   - Organization: `TestOrg`
4. Click "Register"

**Expected Results:**
- ✅ Success message appears
- ✅ User is automatically logged in
- ✅ Redirected to Dashboard
- ✅ Token saved in localStorage (check Application tab)
- ✅ User role shown in navbar (should be "admin" for first user)

**Verify:**
- Check Network tab: `POST /api/auth/register` → Status 201
- Check Console: No errors
- Check localStorage: `token` key exists

---

### Test 1.2: User Login

**Steps:**
1. Logout if logged in
2. Click "Login"
3. Enter credentials:
   - Email: `admin1@test.com`
   - Password: `password123`
4. Click "Login"

**Expected Results:**
- ✅ Success message
- ✅ Redirected to Dashboard
- ✅ Token in localStorage
- ✅ User info displayed in navbar

**Verify:**
- Network tab: `POST /api/auth/login` → Status 200
- Response contains `token` and `user` object
- Token is stored in localStorage

---

### Test 1.3: Invalid Login Credentials

**Steps:**
1. Try login with:
   - Email: `wrong@test.com`
   - Password: `wrongpass`
2. Click "Login"

**Expected Results:**
- ❌ Error message: "Invalid credentials"
- ❌ User NOT logged in
- ❌ No token in localStorage
- ❌ Stays on login page

**Verify:**
- Network tab: `POST /api/auth/login` → Status 401

---

### Test 1.4: Protected Route Access (Without Login)

**Steps:**
1. Logout
2. Clear localStorage (Application tab → Clear storage)
3. Try to access: `http://localhost:5173` (Dashboard)

**Expected Results:**
- ❌ Redirected to Login page
- ❌ Cannot access Dashboard

**Verify:**
- Check Network tab: `GET /api/auth/me` → Status 401 (if called)

---

### Test 1.5: Token Expiration/Invalid Token

**Steps:**
1. Login successfully
2. Open Console
3. Run: `localStorage.setItem('token', 'invalid_token_12345')`
4. Refresh page

**Expected Results:**
- ❌ Redirected to Login page
- ❌ Error in console about invalid token

**Verify:**
- Network tab: `GET /api/auth/me` → Status 401

---

---

## 📤 PHASE 2: Video Upload & Processing

### Test 2.1: Video Upload (Editor Role)

**Prerequisites:**
- Login as `editor1` (or admin)
- Have a test video file ready (MP4, MOV, etc.)

**Steps:**
1. Login as `editor1@test.com`
2. On Dashboard, find "Upload Video" section
3. Click "Choose File" and select a video file
4. (Optional) Enter title and description
5. Click "Upload Video"

**Expected Results:**
- ✅ Upload progress bar appears (0-100%)
- ✅ Shows "Uploading X%..." message
- ✅ After upload: Success message
- ✅ Video appears in video list
- ✅ Video status: "Processing" (blue badge)
- ✅ Progress bar overlay on video card (0% initially)

**Verify:**
- Network tab: `POST /api/videos/upload` → Status 201
- File is uploaded to `backend/uploads/` folder
- Video record created in database with status "uploading" → "processing"

---

### Test 2.2: Real-Time Processing Progress

**Prerequisites:**
- Video uploaded in Test 2.1

**Steps:**
1. After upload, watch the video card
2. Observe the progress bar overlay
3. Wait for processing to complete

**Expected Results:**
- ✅ Progress bar updates in real-time: 0% → 10% → 30% → 70% → 90% → 100%
- ✅ Status messages change:
   - "Starting video processing..."
   - "Retrieved video metadata" (10%)
   - "Generated thumbnail" (30%)
   - "Compressing video..." (30-70%)
   - "Video compressed" (70%)
   - "Analyzed content sensitivity" (90%)
   - "Processing completed" (100%)
- ✅ Status badge changes: "Processing" → "Ready" (green)
- ✅ Thumbnail appears on video card
- ✅ Video becomes playable

**Verify:**
- Open Network tab → WS (WebSocket) tab
- See Socket.IO connection established
- See `processing:progress` events being received
- Check Console: Socket connection logs
- Backend console: Progress emission logs

---

### Test 2.3: Upload Progress (Network Transfer)

**Steps:**
1. Upload a large video file (50MB+)
2. Watch the upload progress bar

**Expected Results:**
- ✅ Progress bar shows 0% → 100% during file upload
- ✅ "Uploading X%..." updates smoothly
- ✅ Button shows "Uploading X%..."

**Verify:**
- Network tab: `POST /api/videos/upload` shows progress
- This is separate from processing progress

---

### Test 2.4: Upload Without File

**Steps:**
1. Click "Upload Video" without selecting a file

**Expected Results:**
- ❌ Alert: "Please select a video file"
- ❌ Upload doesn't start

---

### Test 2.5: Viewer Role Cannot Upload

**Steps:**
1. Logout
2. Login as `viewer1@test.com`
3. Go to Dashboard

**Expected Results:**
- ❌ "Upload Video" section shows message: "You have view-only access"
- ❌ No upload form visible
- ✅ Shield icon displayed

**Verify:**
- Check role-based UI rendering

---

### Test 2.6: Multiple Video Uploads

**Steps:**
1. Upload 3-4 videos in quick succession
2. Watch all video cards

**Expected Results:**
- ✅ All videos appear in list
- ✅ Each video shows independent progress
- ✅ All process simultaneously
- ✅ Each updates independently via Socket.IO

**Verify:**
- Check `processingProgress` state in React DevTools
- Should have multiple video IDs: `{ "id1": 45, "id2": 78, "id3": 12 }`

---

---

## 🎬 PHASE 3: Video Streaming & Playback

### Test 3.1: Video Playback (Completed Video)

**Prerequisites:**
- Video uploaded and processing completed (status: "Ready")

**Steps:**
1. Find a video with "Ready" status (green badge)
2. Click "Play" button
3. Video player modal opens
4. Click play in video player

**Expected Results:**
- ✅ Video player modal opens
- ✅ Video starts playing
- ✅ Controls work (play, pause, volume, seek)
- ✅ Video quality is good
- ✅ No buffering issues (for small videos)

**Verify:**
- Network tab: `GET /api/videos/{id}/stream?token=...` → Status 200 or 206
- Check for Range requests: `Range: bytes=0-1048575`
- Response: `206 Partial Content` with `Content-Range` header
- Multiple requests as video plays (chunked streaming)

---

### Test 3.2: Video Seeking (Jump to Middle)

**Steps:**
1. Play a video
2. Click on progress bar at 50% position
3. Video should jump to middle

**Expected Results:**
- ✅ Video jumps to middle position
- ✅ New Range request sent: `Range: bytes=25000000-26000000` (example)
- ✅ Video continues playing from new position
- ✅ No need to download entire file

**Verify:**
- Network tab: See new request with different Range header
- Response: `206 Partial Content`
- `Content-Range` shows bytes from middle of file

---

### Test 3.3: HTTP Range Request Verification

**Steps:**
1. Open Network tab
2. Play a video
3. Observe requests

**Expected Results:**
- ✅ First request: No Range header → `200 OK` with `Accept-Ranges: bytes`
- ✅ Subsequent requests: `Range: bytes=X-Y` → `206 Partial Content`
- ✅ `Content-Range` header: `bytes X-Y/TOTAL`
- ✅ Multiple chunked requests as video plays

**Verify:**
- Check Request Headers: `Range: bytes=...`
- Check Response Headers: `Content-Range: bytes X-Y/TOTAL`
- Check Status: `206 Partial Content`

---

### Test 3.4: Cannot Play Processing Video

**Steps:**
1. Upload a video
2. While it's processing (status: "Processing")
3. Try to click "Play" button

**Expected Results:**
- ❌ "Play" button is disabled (grayed out)
- ❌ Cannot click it
- ✅ Button shows disabled state

---

### Test 3.5: Video Streaming Authorization

**Steps:**
1. Login as `editor1`
2. Upload a video
3. Logout
4. Login as `viewer1` (different user)
5. Try to play the video (if not assigned/public)

**Expected Results:**
- ❌ If video is not assigned and not public: Cannot access
- ✅ If video is assigned or public: Can access
- Check authorization logic based on role

**Verify:**
- Network tab: `GET /api/videos/{id}/stream` → Status 403 if unauthorized

---

### Test 3.6: Video Views Counter

**Steps:**
1. Play a video
2. Close video player
3. Check video card

**Expected Results:**
- ✅ Views count increases
- ✅ Shows updated view count

**Verify:**
- Refresh page and check if view count persists
- Check database: `views` field incremented

---

---

## 🎛️ PHASE 4: Video Management

### Test 4.1: Edit Video Details

**Prerequisites:**
- Login as `editor1` or `admin1`
- Have a completed video

**Steps:**
1. Find a video you uploaded
2. Click "Edit" button (pencil icon)
3. Modal opens
4. Change title and description
5. Click "Save"

**Expected Results:**
- ✅ Modal opens with current video data
- ✅ Can edit title and description
- ✅ Changes saved successfully
- ✅ Video card updates with new title/description
- ✅ Success message (if implemented)

**Verify:**
- Network tab: `PATCH /api/videos/{id}` → Status 200
- Database: Video record updated

---

### Test 4.2: Delete Video

**Steps:**
1. Find a video you uploaded
2. Click "Delete" button (trash icon)
3. Confirm deletion

**Expected Results:**
- ✅ Confirmation dialog: "Delete this video?"
- ✅ After confirm: Video removed from list
- ✅ Video file deleted from server
- ✅ Processed video deleted
- ✅ Thumbnail deleted

**Verify:**
- Network tab: `DELETE /api/videos/{id}` → Status 200
- Check `backend/uploads/` folder: File removed
- Check `backend/processed/` folder: Processed file and thumbnail removed
- Database: Video record deleted

---

### Test 4.3: Viewer Cannot Edit/Delete

**Steps:**
1. Login as `viewer1`
2. View video list

**Expected Results:**
- ❌ No "Edit" button visible
- ❌ No "Delete" button visible
- ✅ Only "Play" button visible

**Verify:**
- Check role-based UI rendering

---

### Test 4.4: Edit Other User's Video (Should Fail)

**Steps:**
1. Login as `editor1`
2. Upload a video
3. Logout
4. Login as `editor2` (different editor)
5. Try to edit the video from step 2

**Expected Results:**
- ❌ Cannot edit (if authorization is correct)
- ❌ Error message: "Not authorized to update this video"

**Verify:**
- Network tab: `PATCH /api/videos/{id}` → Status 403

---

### Test 4.5: Admin Can Edit/Delete Any Video

**Steps:**
1. Login as `admin1`
2. Find any video (even uploaded by others)
3. Try to edit/delete

**Expected Results:**
- ✅ Admin can edit any video
- ✅ Admin can delete any video
- ✅ No authorization errors

**Verify:**
- Network tab: Requests succeed with Status 200

---

---

## 🔍 PHASE 5: Advanced Features

### Test 5.1: Video Search

**Steps:**
1. Upload videos with different titles
2. In search box, type part of a video title
3. Press Enter or wait

**Expected Results:**
- ✅ Video list filters to matching videos
- ✅ Search is case-insensitive
- ✅ Searches in title and description

**Verify:**
- Network tab: `GET /api/videos?search=...` → Status 200
- Response contains filtered videos

---

### Test 5.2: Filter by Status

**Steps:**
1. Have videos with different statuses (processing, completed, failed)
2. Select "Status" filter → "Processing"

**Expected Results:**
- ✅ Only shows videos with "Processing" status
- ✅ Filter persists when navigating

**Verify:**
- Network tab: `GET /api/videos?status=processing`

---

### Test 5.3: Filter by Sensitivity Status

**Steps:**
1. Select "Content" filter → "Safe" or "Flagged"

**Expected Results:**
- ✅ Filters videos by sensitivity status
- ✅ Shows only matching videos

**Verify:**
- Network tab: `GET /api/videos?sensitivityStatus=safe`

---

### Test 5.4: Sort Videos

**Steps:**
1. Select "Sort By" → "Title"
2. Select "Order" → "Ascending"

**Expected Results:**
- ✅ Videos sorted alphabetically by title
- ✅ Order changes when toggled

**Verify:**
- Network tab: `GET /api/videos?sortBy=title&order=asc`

---

### Test 5.5: Advanced Filters (Date Range)

**Steps:**
1. Click "Show Advanced" in filters
2. Set "Start Date" and "End Date"
3. Videos should filter

**Expected Results:**
- ✅ Only shows videos uploaded in date range
- ✅ Date filters work correctly

**Verify:**
- Network tab: `GET /api/videos?startDate=...&endDate=...`

---

### Test 5.6: Advanced Filters (File Size)

**Steps:**
1. Show Advanced filters
2. Set "Min Size" and "Max Size" (in MB)

**Expected Results:**
- ✅ Filters videos by file size
- ✅ Only shows videos within size range

**Verify:**
- Network tab: `GET /api/videos?minSize=...&maxSize=...`

---

### Test 5.7: Advanced Filters (Duration)

**Steps:**
1. Show Advanced filters
2. Set "Min Duration" and "Max Duration" (in seconds)

**Expected Results:**
- ✅ Filters videos by duration
- ✅ Only shows videos within duration range

**Verify:**
- Network tab: `GET /api/videos?minDuration=...&maxDuration=...`

---

### Test 5.8: Pagination

**Steps:**
1. Upload more than 10 videos (or set limit to 5)
2. Navigate to page 2

**Expected Results:**
- ✅ Pagination controls appear
- ✅ Can navigate between pages
- ✅ Shows "Page X of Y"
- ✅ Videos change when navigating pages

**Verify:**
- Network tab: `GET /api/videos?page=2&limit=10`

---

### Test 5.9: Video Assignment

**Prerequisites:**
- Login as `admin1` or `editor1`
- Have a completed video
- Have `viewer1` user created

**Steps:**
1. Find a video
2. Click "Assign" (if button exists) or use API
3. Select user(s) to assign
4. Save

**Expected Results:**
- ✅ Video assigned to selected user(s)
- ✅ Assigned user can now view the video
- ✅ Assignment persists

**Verify:**
- Network tab: `POST /api/videos/{id}/assign` → Status 200
- Database: `assignedTo` field updated
- Login as assigned viewer: Can see video

---

---

## 👥 PHASE 6: Admin Functions

### Test 6.1: Access Admin Panel

**Steps:**
1. Login as `admin1`
2. Click "Admin Panel" button in navbar

**Expected Results:**
- ✅ Admin Panel opens
- ✅ Shows user management table
- ✅ Lists all users with details

**Verify:**
- Network tab: `GET /api/users` → Status 200
- Only admins can access (Test 6.2)

---

### Test 6.2: Non-Admin Cannot Access Admin Panel

**Steps:**
1. Login as `editor1` or `viewer1`
2. Check navbar

**Expected Results:**
- ❌ "Admin Panel" button NOT visible
- ❌ Cannot access `/admin` route (if exists)

**Verify:**
- Try direct API call: `GET /api/users` → Status 403

---

### Test 6.3: Change User Role

**Steps:**
1. Login as `admin1`
2. Go to Admin Panel
3. Find `viewer1` user
4. Change role dropdown from "viewer" to "editor"
5. Confirm

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Role changes successfully
- ✅ User table updates
- ✅ User now has editor privileges

**Verify:**
- Network tab: `PATCH /api/users/{id}/role` → Status 200
- Database: User role updated
- Logout and login as that user: Should have editor access

---

### Test 6.4: Toggle User Status (Activate/Deactivate)

**Steps:**
1. In Admin Panel, find a user
2. Click "Deactivate" or "Activate" button

**Expected Results:**
- ✅ Confirmation dialog
- ✅ Status toggles (Active ↔ Inactive)
- ✅ Badge color changes (green ↔ red)
- ✅ User status updated

**Verify:**
- Network tab: `PATCH /api/users/{id}/status` → Status 200
- Database: `isActive` field toggled

---

### Test 6.5: Search Users in Admin Panel

**Steps:**
1. In Admin Panel, type in search box
2. Press Enter or click Search

**Expected Results:**
- ✅ User list filters
- ✅ Shows matching users

**Verify:**
- Network tab: `GET /api/users?search=...`

---

---

## ⚠️ PHASE 7: Edge Cases & Error Handling

### Test 7.1: Upload Very Large Video

**Steps:**
1. Try to upload a video > 100MB (if limit exists)

**Expected Results:**
- ✅ Either: Upload succeeds (if no limit)
- ❌ Or: Error message about file size limit

**Verify:**
- Check multer configuration for file size limits

---

### Test 7.2: Upload Invalid File Type

**Steps:**
1. Try to upload a .txt or .pdf file (not video)

**Expected Results:**
- ❌ Error message: "Invalid file type" or similar
- ❌ Upload rejected

**Verify:**
- Check multer file filter configuration

---

### Test 7.3: Processing Failure

**Steps:**
1. Upload a corrupted video file (if possible)
2. Watch processing

**Expected Results:**
- ❌ Processing fails
- ❌ Status changes to "Failed" (red badge)
- ❌ Error message displayed
- ✅ Socket.IO error event received

**Verify:**
- Backend console: Error logs
- Frontend: `processing:error` socket event received

---

### Test 7.4: Network Disconnection During Upload

**Steps:**
1. Start uploading a large video
2. Disconnect internet mid-upload
3. Reconnect

**Expected Results:**
- ❌ Upload fails
- ❌ Error message displayed
- ✅ Can retry upload

---

### Test 7.5: Socket Disconnection During Processing

**Steps:**
1. Upload a video
2. While processing, close browser tab
3. Reopen and login
4. Check video status

**Expected Results:**
- ✅ Video continues processing on backend
- ✅ When you return, video shows current status
- ✅ Progress updates when socket reconnects

**Verify:**
- Backend: Processing continues even if client disconnects
- Frontend: Socket reconnects and receives updates

---

### Test 7.6: Multiple Tabs/Windows

**Steps:**
1. Open application in 2 browser tabs
2. Login in both
3. Upload video in Tab 1
4. Watch Tab 2

**Expected Results:**
- ✅ Both tabs receive Socket.IO updates
- ✅ Progress updates in both tabs
- ✅ Both tabs show same video list

---

### Test 7.7: Token Expires During Session

**Steps:**
1. Login
2. Wait for token to expire (or manually expire it)
3. Try to perform an action (upload, edit, etc.)

**Expected Results:**
- ❌ Action fails
- ❌ Redirected to login page
- ❌ Error message about expired token

---

### Test 7.8: Concurrent Video Processing

**Steps:**
1. Upload 5 videos simultaneously
2. Watch all process

**Expected Results:**
- ✅ All videos process concurrently
- ✅ Each shows independent progress
- ✅ No conflicts or errors
- ✅ All complete successfully

---

### Test 7.9: Video Streaming with Slow Network

**Steps:**
1. Open Network tab → Throttling
2. Set to "Slow 3G"
3. Play a video

**Expected Results:**
- ✅ Video still plays (may buffer)
- ✅ Range requests work correctly
- ✅ Seeking still works
- ✅ No errors

---

### Test 7.10: Invalid Video ID in URL

**Steps:**
1. Try to access: `/api/videos/invalid_id123/stream?token=...`

**Expected Results:**
- ❌ Error: "Video not found"
- ❌ Status 404

---

---

## 📊 Testing Checklist Summary

### Authentication ✅
- [ ] Registration
- [ ] Login
- [ ] Invalid credentials
- [ ] Protected routes
- [ ] Token expiration

### Video Upload ✅
- [ ] Upload video (editor/admin)
- [ ] Upload progress
- [ ] Viewer cannot upload
- [ ] Multiple uploads
- [ ] Invalid file types

### Real-Time Processing ✅
- [ ] Progress updates (0% → 100%)
- [ ] Status messages
- [ ] Socket.IO connection
- [ ] Multiple videos processing
- [ ] Processing failure handling

### Video Streaming ✅
- [ ] Video playback
- [ ] HTTP Range requests
- [ ] Seeking functionality
- [ ] Authorization
- [ ] Views counter

### Video Management ✅
- [ ] Edit video
- [ ] Delete video
- [ ] Role-based access
- [ ] Admin privileges

### Filters & Search ✅
- [ ] Text search
- [ ] Status filter
- [ ] Sensitivity filter
- [ ] Sort options
- [ ] Advanced filters
- [ ] Pagination

### Admin Functions ✅
- [ ] Admin panel access
- [ ] Change user roles
- [ ] Toggle user status
- [ ] User search

### Edge Cases ✅
- [ ] Large files
- [ ] Invalid files
- [ ] Network issues
- [ ] Socket disconnection
- [ ] Concurrent operations

---

## 🐛 Common Issues to Watch For

1. **Socket.IO not connecting**: Check CORS settings, backend URL
2. **Progress not updating**: Check Socket.IO room joining (user ID)
3. **Video not playing**: Check authorization, file paths, Range requests
4. **Upload fails**: Check file size limits, multer configuration
5. **Processing stuck**: Check FFmpeg installation, file permissions
6. **Authorization errors**: Check JWT token, role assignments

---

## 📝 Testing Notes Template

```
Date: ___________
Tester: ___________
Browser: ___________
Backend URL: ___________
Frontend URL: ___________

Test Results:
- Test 1.1: ✅ / ❌ (Notes: ___________)
- Test 2.1: ✅ / ❌ (Notes: ___________)
...

Issues Found:
1. ___________
2. ___________

Screenshots: [Attach if needed]
```

---

## 🎯 Quick Test Scenarios

### Scenario 1: Happy Path
1. Register as admin
2. Upload video
3. Watch processing progress
4. Play video
5. Edit video details
6. Delete video

### Scenario 2: Multi-User
1. Create 3 users (admin, editor, viewer)
2. Editor uploads video
3. Admin assigns to viewer
4. Viewer plays video
5. Admin changes viewer to editor
6. New editor can now upload

### Scenario 3: Stress Test
1. Upload 10 videos simultaneously
2. Watch all process
3. Play multiple videos
4. Use filters and search
5. Test pagination

---

**End of Testing Guide**

