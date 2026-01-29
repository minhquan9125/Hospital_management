# API Documentation - Doctors Management

## Overview
This document provides instructions on how to test the 3 new Doctor APIs using Postman.

---

## API 1: Get Doctors List (JSON Format)
**Description:** Retrieve all doctors in JSON format without authentication.

### Request Details
- **HTTP Method:** `GET`
- **Endpoint:** `http://localhost:5000/api/doctors/list-json`
- **Authentication:** None (Public)
- **Headers:** 
  - `Content-Type: application/json`

### Postman Steps
1. Create a new request with method `GET`
2. Enter URL: `http://localhost:5000/api/doctors/list-json`
3. Go to **Headers** tab and add:
   - Key: `Content-Type` | Value: `application/json`
4. Click **Send**

### Response Example (200 OK)
```json
{
  "success": true,
  "message": "Doctors list retrieved successfully",
  "data": [
    {
      "_id": "ObjectId",
      "id": 1,
      "name": "Dr. Ahmed",
      "specialization": "Cardiology",
      "Experience": "10 years",
      "availability": "Monday-Friday",
      "photoUrl": "https://example.com/doctor.jpg",
      "departmentId": "CARD001",
      "department": "Cardiology Department"
    },
    ...
  ]
}
```

---

## API 2: Get Doctors by Department ID
**Description:** Retrieve doctors filtered by department ID.

### Request Details
- **HTTP Method:** `GET`
- **Endpoint:** `http://localhost:5000/api/doctors/department/{departmentId}`
- **Authentication:** None (Public)
- **URL Parameters:**
  - `departmentId` (required) - The department ID to filter by

### Postman Steps
1. Create a new request with method `GET`
2. Enter URL: `http://localhost:5000/api/doctors/department/CARD001`
   - Replace `CARD001` with your actual department ID
3. Go to **Headers** tab and add:
   - Key: `Content-Type` | Value: `application/json`
4. Click **Send**

### Example URLs
- `http://localhost:5000/api/doctors/department/CARD001` (Cardiology)
- `http://localhost:5000/api/doctors/department/NEURO001` (Neurology)
- `http://localhost:5000/api/doctors/department/ORTHO001` (Orthopedics)

### Response Example (200 OK)
```json
{
  "success": true,
  "message": "Doctors in department CARD001 retrieved successfully",
  "departmentId": "CARD001",
  "count": 2,
  "data": [
    {
      "_id": "ObjectId",
      "id": 1,
      "name": "Dr. Ahmed",
      "specialization": "Cardiology",
      "Experience": "10 years",
      "availability": "Monday-Friday",
      "photoUrl": "https://example.com/doctor.jpg",
      "departmentId": "CARD001",
      "department": "Cardiology Department"
    },
    ...
  ]
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Department ID is required"
}
```

---

## API 3: Get Doctors with Authentication
**Description:** Retrieve all doctors with authentication token. Only authenticated users can access this endpoint.

### Request Details
- **HTTP Method:** `GET`
- **Endpoint:** `http://localhost:5000/api/doctors/authenticated`
- **Authentication:** Required (JWT Token)
- **Headers:**
  - `Content-Type: application/json`
  - `Cookie: token=<your_jwt_token>`

### How to Get Authentication Token

#### Step 1: Login to get JWT Token
1. Create a new request with method `POST`
2. Enter URL: `http://localhost:5000/api/auth/login`
3. Go to **Body** tab, select **raw** → **JSON**
4. Enter login credentials:
```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```
5. Click **Send**
6. Copy the token from response (usually in `token` field)

#### Step 2: Use Token to Access Authenticated API
1. Create a new request with method `GET`
2. Enter URL: `http://localhost:5000/api/doctors/authenticated`
3. Go to **Headers** tab and add:
   - Key: `Content-Type` | Value: `application/json`
4. Go to **Cookies** tab (or use Authorization header):
   - **Option A - Using Cookies:**
     - Key: `token` | Value: `<your_jwt_token>`
   - **Option B - Using Authorization Header:**
     - Key: `Authorization` | Value: `Bearer <your_jwt_token>`
5. Click **Send**

### Alternative: Using Pre-request Script
1. In Postman, go to **Environment** or **Collection** settings
2. Create a variable: `token` with your JWT token value
3. In Headers, add:
   - Key: `Cookie` | Value: `token={{token}}`
4. Click **Send**

### Response Example (200 OK)
```json
{
  "success": true,
  "message": "Doctors list retrieved successfully (Authenticated)",
  "authenticatedUser": "ObjectId_of_user",
  "userRole": "admin",
  "data": [
    {
      "_id": "ObjectId",
      "id": 1,
      "name": "Dr. Ahmed",
      "specialization": "Cardiology",
      "Experience": "10 years",
      "availability": "Monday-Friday",
      "photoUrl": "https://example.com/doctor.jpg",
      "departmentId": "CARD001",
      "department": "Cardiology Department"
    },
    ...
  ]
}
```

### Error Response (Unauthorized - 401)
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## Summary Comparison Table

| Feature | API 1 | API 2 | API 3 |
|---------|-------|-------|-------|
| Endpoint | `/api/doctors/list-json` | `/api/doctors/department/:departmentId` | `/api/doctors/authenticated` |
| Method | GET | GET | GET |
| Authentication | No | No | Yes |
| Filter | All Doctors | By Department | All Doctors |
| Purpose | Get all doctors | Find doctors by department | Secure access for authenticated users |

---

## Testing Tips

### Environment Variables in Postman
1. Click on the **Environment** icon (top right)
2. Create new environment: `Hospital API Dev`
3. Add variables:
   - `base_url` = `http://localhost:5000`
   - `token` = `<your_jwt_token>`

### Use in Requests
Replace hardcoded URLs with:
```
{{base_url}}/api/doctors/list-json
{{base_url}}/api/doctors/department/CARD001
{{base_url}}/api/doctors/authenticated
```

---

## Common Issues & Solutions

### Issue: "Cannot GET /api/doctors/authenticated"
**Solution:** Ensure the token is correctly passed in the Cookie or Authorization header.

### Issue: "Department ID is required"
**Solution:** Make sure you include the departmentId in the URL path (e.g., `/department/CARD001`).

### Issue: "Unauthorized"
**Solution:** 
1. Check if token is expired
2. Verify token is correctly copied from login response
3. Ensure token is in the correct format

---

## Database Update
To add departmentId to existing doctors, update your doctor documents:

```javascript
// Update all doctors with departmentId
db.doctors.updateOne(
  { name: "Dr. Ahmed" },
  { $set: { departmentId: "CARD001", department: "Cardiology Department" } }
)
```

Or update via API by making a PUT request with new fields included.
