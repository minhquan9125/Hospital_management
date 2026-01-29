# 🏥 Hospital Management - Doctor APIs Guide

## 📌 Quick Summary

I've created **3 new Doctor APIs** with different features:

| # | API | Purpose | Auth Required | Filter |
|---|-----|---------|---|---------|
| 1 | `GET /api/doctors/list-json` | Get all doctors as JSON | ❌ No | All doctors |
| 2 | `GET /api/doctors/department/:departmentId` | Get doctors by department | ❌ No | By Department ID |
| 3 | `GET /api/doctors/authenticated` | Secure doctors list | ✅ Yes | All doctors (token required) |

---

## 🚀 Getting Started

### 1️⃣ Start Your Server
```bash
cd server
npm install  # If not done
npm start
```

### 2️⃣ Test in Postman

#### Option A: Quick Test
1. Open Postman
2. Create NEW request
3. Method: `GET`
4. URL: `http://localhost:5000/api/doctors/list-json`
5. Click **Send**

#### Option B: Full Setup with Postman Collection
See [POSTMAN_API_GUIDE.md](./POSTMAN_API_GUIDE.md) for complete instructions

---

## 📖 API Details

### API 1: Get All Doctors (Public)
**Endpoint:** `GET /api/doctors/list-json`

**Use this when:**
- You need to display all doctors on frontend
- No authentication needed
- Simple JSON response

**Example Request:**
```javascript
fetch('http://localhost:5000/api/doctors/list-json')
  .then(r => r.json())
  .then(data => console.log(data.data)) // doctors array
```

**Response:**
```json
{
  "success": true,
  "message": "Doctors list retrieved successfully",
  "data": [
    {
      "_id": "mongo_id",
      "id": 1,
      "name": "Dr. Ahmed",
      "specialization": "Cardiology",
      "Experience": "10 years",
      "availability": "Monday-Friday",
      "photoUrl": "...",
      "departmentId": "CARD001",
      "department": "Cardiology Department"
    }
  ]
}
```

---

### API 2: Get Doctors by Department (Public)
**Endpoint:** `GET /api/doctors/department/:departmentId`

**Use this when:**
- You want to filter doctors by specific department
- Display department-specific doctors
- No authentication needed

**Example URLs:**
```
http://localhost:5000/api/doctors/department/CARD001
http://localhost:5000/api/doctors/department/NEURO001
http://localhost:5000/api/doctors/department/ORTHO001
```

**Example Request:**
```javascript
const departmentId = 'CARD001';
fetch(`http://localhost:5000/api/doctors/department/${departmentId}`)
  .then(r => r.json())
  .then(data => {
    console.log(`Found ${data.count} doctors`);
    console.log(data.data); // filtered doctors
  })
```

**Response:**
```json
{
  "success": true,
  "message": "Doctors in department CARD001 retrieved successfully",
  "departmentId": "CARD001",
  "count": 3,
  "data": [
    // Array of doctors in that department
  ]
}
```

**Error Response (if no department ID provided):**
```json
{
  "success": false,
  "message": "Department ID is required"
}
```

---

### API 3: Get Doctors with Authentication (Secured)
**Endpoint:** `GET /api/doctors/authenticated`

**Use this when:**
- Only authenticated users should access
- You want to log who accessed the data
- Sensitive operations

**Requirements:**
- Valid JWT token
- Token passed as Cookie or Authorization header

**Step 1: Login to Get Token**
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'your@email.com',
    password: 'your_password'
  })
});
const data = await response.json();
const token = data.token; // Save this token
```

**Step 2: Use Token to Access API**
```javascript
fetch('http://localhost:5000/api/doctors/authenticated', {
  headers: {
    'Cookie': `token=${token}` // OR use Authorization header
  },
  credentials: 'include'
})
.then(r => r.json())
.then(data => {
  console.log('User ID:', data.authenticatedUser);
  console.log('Doctors:', data.data);
})
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Doctors list retrieved successfully (Authenticated)",
  "authenticatedUser": "user_id_here",
  "userRole": "admin",
  "data": [
    // All doctors array
  ]
}
```

**Response (Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## 🔐 Authentication Details

### How Authentication Works
1. User logs in → Gets JWT token
2. Token is stored in cookies (or localStorage)
3. When accessing `/authenticated` endpoint:
   - Middleware checks if token exists
   - Validates token using JWT secret
   - If valid → User data added to request → API executes
   - If invalid/missing → Returns "Unauthorized"

### Token Flow
```
Login (POST /api/auth/login)
    ↓
Receive JWT Token
    ↓
Store Token (Cookie or localStorage)
    ↓
Send Token with Request
    ↓
Middleware Validates Token
    ↓
Access API (GET /api/doctors/authenticated)
```

---

## 💾 Database Schema Update

### Before (Old Doctor Model)
```javascript
{
  id: Number,
  name: String,
  specialization: String,
  Experience: String,
  availability: String,
  photoUrl: String
}
```

### After (New Doctor Model)
```javascript
{
  id: Number,
  name: String,
  specialization: String,
  Experience: String,
  availability: String,
  photoUrl: String,
  departmentId: String,    // NEW ← Department ID
  department: String       // NEW ← Department Name
}
```

### Update Existing Documents
```javascript
// MongoDB Query to add department to existing doctors
db.doctors.updateMany(
  {},
  [
    {
      $set: {
        departmentId: { $cond: [{ $eq: ["$specialization", "Cardiology"] }, "CARD001", "GENERAL"] },
        department: { $cond: [{ $eq: ["$specialization", "Cardiology"] }, "Cardiology Department", "General"] }
      }
    }
  ]
)
```

---

## 🛠️ Files Modified

### 1. `server/models/doctor.js`
- Added `departmentId` field
- Added `department` field

### 2. `server/controllers/adminController.js`
- `getDoctorsJSON()` - API 1 controller
- `getDoctorsByDepartment()` - API 2 controller
- `getDoctorsAuthenticatedJSON()` - API 3 controller

### 3. `server/routes/doctorRoutes.js`
- New route: `/list-json` (API 1)
- New route: `/department/:departmentId` (API 2)
- New route: `/authenticated` (API 3 with middleware)

---

## ✅ Verification Checklist

After implementation, verify:

- [ ] Server starts without errors
- [ ] API 1: `GET /list-json` returns all doctors
- [ ] API 2: `GET /department/CARD001` returns filtered doctors
- [ ] API 2: Empty department returns empty array
- [ ] API 3: Accessing without token returns "Unauthorized"
- [ ] API 3: With valid token returns doctor list
- [ ] All responses have consistent JSON format
- [ ] Response includes proper `success` and `message` fields

---

## 🧪 Testing Tools

### Option 1: Postman (Recommended)
- Visual request builder
- Store variables and tokens
- Collection for organizing requests
- See [POSTMAN_API_GUIDE.md](./POSTMAN_API_GUIDE.md)

### Option 2: cURL
```bash
# API 1
curl http://localhost:5000/api/doctors/list-json

# API 2
curl http://localhost:5000/api/doctors/department/CARD001

# API 3 (with token)
curl http://localhost:5000/api/doctors/authenticated \
  -H "Cookie: token=YOUR_TOKEN"
```

### Option 3: JavaScript (Frontend)
See [API_TESTING_EXAMPLES.md](./API_TESTING_EXAMPLES.md) for complete examples

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot GET /api/doctors/list-json" | Ensure server is running on port 5000 |
| "Unauthorized" on API 3 | Check if token is valid and not expired |
| Empty array from API 2 | Check if doctors have `departmentId` field in DB |
| CORS errors | Check if `cors` is enabled in `index.js` |
| "Department ID is required" | Pass departmentId in URL path like `/department/CARD001` |

---

## 📚 Related Documentation

- [POSTMAN_API_GUIDE.md](./POSTMAN_API_GUIDE.md) - Complete Postman setup
- [API_TESTING_EXAMPLES.md](./API_TESTING_EXAMPLES.md) - Code examples
- [API_IMPLEMENTATION_SUMMARY.md](./API_IMPLEMENTATION_SUMMARY.md) - Technical summary

---

## 🎯 Next Steps

1. **Test APIs** using Postman or cURL
2. **Update Database** - Add `departmentId` to existing doctors
3. **Integrate Frontend** - Update React components to use new APIs
4. **Add Error Handling** - Handle failures gracefully
5. **Monitor Usage** - Track which API is most used

---

## 💡 Tips for Frontend Integration

### Using in React Components
```javascript
// In your component or custom hook
const [doctors, setDoctors] = useState([]);

useEffect(() => {
  // Choose one of the APIs based on your need:
  
  // Option 1: All doctors
  fetch('/api/doctors/list-json')
  
  // Option 2: By department
  fetch(`/api/doctors/department/${deptId}`)
  
  // Option 3: Authenticated users only
  fetch('/api/doctors/authenticated', {
    credentials: 'include'
  })
}, []);
```

### Environment Configuration
```javascript
// Create a config file
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const doctorAPIs = {
  getAll: () => `${API_BASE}/api/doctors/list-json`,
  byDepartment: (id) => `${API_BASE}/api/doctors/department/${id}`,
  authenticated: () => `${API_BASE}/api/doctors/authenticated`
};
```

---

## 🎉 Summary

You now have **3 fully functional Doctor APIs**:
- ✅ Public API for getting all doctors
- ✅ Public API for filtering by department
- ✅ Secured API requiring authentication

All ready to use in your Hospital Management Website!

For detailed testing instructions, see [POSTMAN_API_GUIDE.md](./POSTMAN_API_GUIDE.md)
