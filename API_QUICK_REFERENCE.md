# 📊 API Quick Reference

## APIs at a Glance

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DOCTOR MANAGEMENT APIs                          │
└─────────────────────────────────────────────────────────────────────┘

API 1: PUBLIC - Get All Doctors
────────────────────────────────────────────
  Method:   GET
  URL:      http://localhost:5000/api/doctors/list-json
  Auth:     ❌ NOT REQUIRED
  Response: All doctors in JSON format
  Use Case: Display doctors list on homepage

Example:
  curl http://localhost:5000/api/doctors/list-json


API 2: PUBLIC - Get Doctors by Department  
────────────────────────────────────────────
  Method:   GET
  URL:      http://localhost:5000/api/doctors/department/{departmentId}
  Auth:     ❌ NOT REQUIRED
  Param:    departmentId (required) - e.g., "CARD001"
  Response: Filtered doctors + count
  Use Case: Show department-specific doctors

Example:
  curl http://localhost:5000/api/doctors/department/CARD001
  
  Available departments:
    - CARD001  (Cardiology)
    - NEURO001 (Neurology)
    - ORTHO001 (Orthopedics)


API 3: SECURED - Get Doctors with Auth
────────────────────────────────────────────
  Method:   GET
  URL:      http://localhost:5000/api/doctors/authenticated
  Auth:     ✅ REQUIRED (JWT Token)
  Response: All doctors + user info
  Use Case: Secure admin dashboard

Example:
  curl -H "Cookie: token=YOUR_JWT_TOKEN" \\
       http://localhost:5000/api/doctors/authenticated

  How to get token:
    1. POST /api/auth/login
    2. Provide email & password
    3. Receive JWT token
    4. Use token in Authorization header
```

---

## Response Format

### Success Response (2xx)
```json
{
  "success": true,
  "message": "Description",
  "data": [
    {
      "_id": "mongo_id",
      "id": 1,
      "name": "Dr. Name",
      "specialization": "Specialty",
      "Experience": "X years",
      "availability": "Days",
      "photoUrl": "url",
      "departmentId": "DEPT001",
      "department": "Department Name"
    }
  ]
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Authentication Flow

```
User Logs In
    │
    ├─ POST /api/auth/login
    │  ├─ email: user@example.com
    │  └─ password: ****
    │
    ▼ (Receive JWT Token)
    
token: "eyJhbGciOiJIUzI1NiIs..."
    │
    ├─ Store in localStorage or cookie
    │
    ▼
    
Access Protected API
    │
    ├─ GET /api/doctors/authenticated
    │  ├─ Header: Cookie: token=...
    │  └─ OR: Authorization: Bearer token...
    │
    ▼ (Middleware validates token)
    
Success: Doctors data returned
Failure: "Unauthorized" error
```

---

## HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Request succeeded |
| 400 | Bad Request | Missing required parameter |
| 401 | Unauthorized | Invalid/missing token |
| 404 | Not Found | Endpoint doesn't exist |
| 500 | Server Error | Database or server issue |

---

## Postman Quick Setup

### 1. Create Environment
```
Environment: Hospital API Dev
  Variables:
    - base_url: http://localhost:5000
    - token: (paste your JWT token here)
```

### 2. Create Requests
```
Request 1: Get All Doctors
  GET {{base_url}}/api/doctors/list-json

Request 2: Get By Department
  GET {{base_url}}/api/doctors/department/CARD001

Request 3: Get Authenticated
  GET {{base_url}}/api/doctors/authenticated
  Headers: Cookie: token={{token}}
```

### 3. Test
Click "Send" and check response

---

## cURL Commands Cheatsheet

### API 1
```bash
curl -X GET http://localhost:5000/api/doctors/list-json
```

### API 2
```bash
curl -X GET http://localhost:5000/api/doctors/department/CARD001
```

### API 3
```bash
curl -X GET http://localhost:5000/api/doctors/authenticated \
  -H "Cookie: token=YOUR_TOKEN_HERE"
```

### Login to Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

---

## JavaScript Fetch Template

### Basic Fetch
```javascript
fetch('http://localhost:5000/api/doctors/list-json')
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log('Doctors:', data.data);
    }
  })
  .catch(err => console.error('Error:', err));
```

### With Authentication
```javascript
fetch('http://localhost:5000/api/doctors/authenticated', {
  headers: {
    'Authorization': `Bearer ${token}`
  },
  credentials: 'include'
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

---

## File Structure

```
Hospital_Management_Website-main/
├── server/
│   ├── models/
│   │   └── doctor.js          ✅ MODIFIED (added departmentId, department)
│   ├── controllers/
│   │   └── adminController.js ✅ MODIFIED (added 3 new functions)
│   └── routes/
│       └── doctorRoutes.js    ✅ MODIFIED (added 3 new routes)
├── DOCTORS_API_README.md      📄 NEW
├── POSTMAN_API_GUIDE.md       📄 NEW
├── API_TESTING_EXAMPLES.md    📄 NEW
└── API_IMPLEMENTATION_SUMMARY.md 📄 NEW
```

---

## Troubleshooting Matrix

| Issue | Likely Cause | Fix |
|-------|------|---|
| 404 Error | Wrong endpoint | Check URL spelling |
| Empty array | No doctors in DB | Add doctors via admin panel |
| "Unauthorized" | Invalid token | Login again to get new token |
| CORS error | Frontend domain not allowed | Check CORS config in server |
| Connection refused | Server not running | Run `npm start` in server folder |
| "Department ID required" | Missing parameter | Include departmentId in URL |

---

## Testing Checklist

```
☐ Server running (npm start)
☐ API 1: GET /list-json returns doctors
☐ API 2: GET /department/{id} returns filtered doctors
☐ API 2: Error handling for missing departmentId
☐ API 3: Accessible only with valid token
☐ API 3: "Unauthorized" without token
☐ All responses have success/message fields
☐ Doctor model has departmentId & department fields
☐ Can test in Postman
☐ Can fetch in JavaScript
```

---

## Key Files to Check

1. **Doctor Model**: `server/models/doctor.js`
   - Contains departmentId and department fields

2. **API Controllers**: `server/controllers/adminController.js`
   - getDoctorsJSON()
   - getDoctorsByDepartment()
   - getDoctorsAuthenticatedJSON()

3. **API Routes**: `server/routes/doctorRoutes.js`
   - /list-json
   - /department/:departmentId
   - /authenticated (with middleware)

---

## Next Steps

1. ✅ Review the 3 APIs
2. ✅ Test using Postman or cURL
3. 🔲 Update database with departmentId values
4. 🔲 Integrate APIs into React components
5. 🔲 Deploy to production

---

## Additional Resources

📖 Full Documentation:
- [DOCTORS_API_README.md](./DOCTORS_API_README.md) - Complete guide
- [POSTMAN_API_GUIDE.md](./POSTMAN_API_GUIDE.md) - Postman setup
- [API_TESTING_EXAMPLES.md](./API_TESTING_EXAMPLES.md) - Code examples
- [API_IMPLEMENTATION_SUMMARY.md](./API_IMPLEMENTATION_SUMMARY.md) - Tech details

🎯 Common Tasks:
- Testing: Use Postman or cURL
- Integration: Use fetch or Axios
- Authentication: Login first, then use token
- Debugging: Check browser console and server logs

---

## Support

If you encounter issues:
1. Check troubleshooting section above
2. Review error message carefully
3. Check server logs (`npm start` terminal)
4. Verify database has doctors with departmentId
5. Ensure token is valid and not expired
