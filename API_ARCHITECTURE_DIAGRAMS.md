# 📊 API Architecture & Flow Diagrams

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CLIENT (React Frontend)                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  Components:                                                    │ │
│  │  - DoctorsList.js      (Calls API 1)                          │ │
│  │  - DepartmentDoctors.js (Calls API 2)                         │ │
│  │  - AdminDashboard.js   (Calls API 3 + Auth)                   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────────────────┘
                          │
                 ┌────────┼────────┐
                 │        │        │
                 ▼        ▼        ▼
            API 1    API 2    API 3
            list-json  dept/:id  auth
```

---

## Request-Response Flow

### API 1: Public List
```
CLIENT                          SERVER                    DATABASE
  │                               │                           │
  ├──GET /list-json────────────────▶│                          │
  │                                 ├──Find all doctors────────▶│
  │                                 │                    ◀──────┤
  │                    Response◀────┤                          │
  │◀────── Success + Doctors Array ─┤                          │
  │                                 │                          │
  └─ Display on page               │                          │
```

---

### API 2: Department Filter
```
CLIENT                          SERVER                    DATABASE
  │                               │                           │
  ├──GET /department/CARD001───────▶│                          │
  │                                 ├──Find by departmentId───▶│
  │                                 │                    ◀──────┤
  │                    Response◀────┤                          │
  │◀────── Count + Filtered Doctors ┤                          │
  │                                 │                          │
  └─ Display department doctors     │                          │
```

---

### API 3: Authenticated Access
```
CLIENT                          SERVER                    DATABASE
  │                               │                           │
  ├──POST /login                   │                          │
  │─(email, password)─────────────▶│                          │
  │                ┌──Validate user──────────────────────────▶│
  │                │                              ◀──────────┤
  │◀──JWT Token────┤                              Username   │
  │                └─ (Stored in Cookie/Storage) │          │
  │                                               │          │
  ├──GET /doctors/authenticated────────────────────▶│          │
  │  Cookie: token=...             │                          │
  │                ┌──Validate Token ────────────┤          │
  │                │   ✓ Valid    X Invalid      │          │
  │                │     │            │          │          │
  │                │     ▼            ▼          │          │
  │                │ Find docs    Error 401      │          │
  │                │  ┌────────────────────────▶│          │
  │                │  │         ◀────────────────┤          │
  │◀──200 OK + Docs┘  │                          │          │
  │◀──401 Unauthorized┘                          │          │
  │                                               │          │
  └─ Display (or redirect to login)              │          │
```

---

## Authentication Token Flow

```
┌─────────────────────────────────────────────────────────┐
│             AUTHENTICATION SEQUENCE                      │
└─────────────────────────────────────────────────────────┘

Step 1: USER LOGS IN
────────────────────
  POST /api/auth/login
  ├─ Email: user@example.com
  ├─ Password: secretpass123
  └─ Response: { token: "eyJhbGc..." }


Step 2: STORE TOKEN
──────────────────
  Options:
  ├─ localStorage.setItem('token', tokenValue)
  ├─ sessionStorage.setItem('token', tokenValue)
  └─ Auto-saved in Cookie by server


Step 3: SEND TOKEN WITH REQUEST
───────────────────────────────
  GET /api/doctors/authenticated
  
  Method A - Cookie Header:
  ├─ Cookie: token=eyJhbGc...
  
  Method B - Authorization Header:
  ├─ Authorization: Bearer eyJhbGc...


Step 4: SERVER VALIDATES TOKEN
──────────────────────────────
  isAuthenticated Middleware:
  ├─ Extract token from request
  ├─ Verify with JWT secret
  ├─ ✓ Valid: req.userId = decoded.id
  ├─ ✓ Valid: req.userRole = decoded.role
  └─ ✗ Invalid: Return 401 Unauthorized


Step 5: GRANT/DENY ACCESS
──────────────────────────
  ✓ Token Valid:
  ├─ Get doctors from database
  ├─ Include user info in response
  └─ Return 200 OK + doctors

  ✗ Token Invalid/Missing:
  ├─ Skip database call
  └─ Return 401 Unauthorized
```

---

## Data Flow Diagram

```
                    ┌─────────────────┐
                    │    MongoDB      │
                    │   Database      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Doctor Model   │
                    │ ┌─────────────┐ │
                    │ │ id          │ │
                    │ │ name        │ │
                    │ │ special.    │ │
                    │ │ experience  │ │
                    │ │ availability│ │
                    │ │ photoUrl    │ │
                    │ │ departmentId│◄─── NEW
                    │ │ department  │◄─── NEW
                    │ └─────────────┘ │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐         ┌────▼────┐        ┌────▼────┐
    │Controller│         │Controller│        │Controller│
    │ API 1   │         │ API 2    │        │ API 3   │
    │getAll() │         │byDept()  │        │authGet()│
    └────┬────┘         └────┬────┘        └────┬────┘
         │                   │                   │
    ┌────▼───────────────────┼───────────────────┴──┐
    │           Express Routes                       │
    │  ┌──────────────┬──────────────┬────────────┐ │
    │  │ /list-json   │ /dept/:id    │ /auth(mid) │ │
    │  └──────────────┴──────────────┴────────────┘ │
    └────────────────────┬────────────────────────────┘
                         │
    ┌────────────────────▼────────────────────┐
    │      Response JSON                      │
    │  {                                      │
    │    "success": true,                    │
    │    "message": "...",                   │
    │    "data": [...doctors...],            │
    │    "authenticatedUser": (API 3 only)   │
    │    "count": (API 2 only)                │
    │  }                                      │
    └────────────────────┬────────────────────┘
                         │
                    ┌────▼────┐
                    │  Client  │
                    │ Display  │
                    └──────────┘
```

---

## API Comparison Matrix

```
┌──────────────────────────────────────────────────────────────────┐
│                       COMPARISON TABLE                            │
├───────┬────────────┬──────────────┬───────────────────┬──────────┤
│ API # │ Endpoint   │ Public? │ Filter? │ Returns  │
├───────┼────────────┼──────────────┼───────────────────┼──────────┤
│   1   │ /list-json │    ✓    │ None  │ All doctors  │
├───────┼────────────┼──────────────┼───────────────────┼──────────┤
│   2   │ /dept/:id  │    ✓    │ Dept  │ Dept doctors │
├───────┼────────────┼──────────────┼───────────────────┼──────────┤
│   3   │ /auth      │   Auth Only   │ None  │ All doctors  │
├───────┴────────────┴──────────────┴───────────────────┴──────────┤
│ All return: success, message, data fields                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## Request Lifecycle

```
1. Client Makes Request
   └─ GET /api/doctors/list-json

2. Express Router Matches Route
   └─ Found: doctorRoutes.js → /list-json

3. Execute Controller (if no middleware needed)
   └─ getDoctorsJSON()

4. For Authenticated API:
   └─ isAuthenticated Middleware
      ├─ Check token
      ├─ Validate token
      └─ If valid, continue. If not, return 401

5. Controller Executes:
   ├─ Query database
   ├─ Doctor.find(query)
   └─ Format response

6. Return Response:
   ├─ Set headers (Content-Type: application/json)
   ├─ res.status(200)
   └─ res.json({...})

7. Client Receives Response:
   ├─ Parse JSON
   ├─ Check success flag
   ├─ Use data array
   └─ Display on page
```

---

## Error Handling Flow

```
              REQUEST
                 │
                 ▼
         Does endpoint exist?
           ├─ NO  → 404 Not Found
           └─ YES ▼
         
         Is it protected?
           ├─ NO  → Skip auth
           └─ YES ▼
         
         Has valid token?
           ├─ NO  → 401 Unauthorized
           └─ YES ▼
         
         Execute logic
           ├─ Database error   → 500 Server Error
           ├─ Bad input        → 400 Bad Request
           └─ Success          → 200 OK ✓
         
              RESPONSE
```

---

## State Management (Frontend Example)

```
┌──────────────────────────────────┐
│    React Component State          │
├──────────────────────────────────┤
│                                  │
│  const [doctors, setDoctors]     │ ◀─ API 1, 2
│  const [loading, setLoading]     │
│  const [error, setError]         │
│  const [department, setDept]     │ ◀─ API 2 param
│                                  │
│  useEffect(() => {               │
│    fetch API → get doctors       │
│    → setDoctors(data)            │
│    → render component            │
│  }, [department])                │
│                                  │
└──────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION ENVIRONMENT                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐         ┌──────────────────────┐ │
│  │   Load Balancer     │         │    Firewall          │ │
│  │  (handles traffic)  │         │  (blocks attacks)    │ │
│  └──────────┬──────────┘         └──────────────────────┘ │
│             │                                               │
│      ┌──────▼─────────┐                                    │
│      │   API Server   │                                    │
│      │  (Express.js)  │                                    │
│      │  ┌──────────┐  │                                    │
│      │  │ Routes   │  │                                    │
│      │  │ - /1     │  │                                    │
│      │  │ - /2     │  │                                    │
│      │  │ - /3     │  │                                    │
│      │  └──────────┘  │                                    │
│      └──────┬─────────┘                                    │
│             │                                              │
│      ┌──────▼─────────┐         ┌──────────────────────┐  │
│      │    MongoDB     │         │   Cache (Redis)      │  │
│      │   Database     │         │ (for faster access)  │  │
│      └────────────────┘         └──────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary of Flows

### API 1 Flow (Simplest)
Request → Route → Controller → DB Query → Format Response → Send Back

### API 2 Flow (With Parameter)
Request (+ param) → Route → Validate Param → Controller → DB Query (filtered) → Send Back

### API 3 Flow (Most Complex)
Request → Route → Middleware (validate token) → Controller → DB Query → Add User Info → Send Back

---

## Quick Visual Reference

```
┌────────────────────────────────────────────────┐
│         API ENDPOINT STRUCTURE                  │
├────────────────────────────────────────────────┤
│                                                │
│  /api/doctors/                                 │
│         │                                      │
│    ┌────┼────┐                                │
│    │    │    │                                │
│    ▼    ▼    ▼                                │
│  /list-json  /department/:id  /authenticated  │
│    (API 1)   (API 2)          (API 3)         │
│                                                │
│  Public   Public             Auth Required    │
│  All      Filtered           All + User Info  │
│                                                │
└────────────────────────────────────────────────┘
```

---

This visual guide helps understand:
✓ How requests flow through the system
✓ Where authentication is checked
✓ How data moves from DB to client
✓ Error handling at each step
✓ Comparison between the 3 APIs
