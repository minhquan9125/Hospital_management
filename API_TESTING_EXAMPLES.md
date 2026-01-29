# API Testing Examples

## cURL Examples

### API 1: Get All Doctors (JSON)
```bash
curl -X GET "http://localhost:5000/api/doctors/list-json" \
  -H "Content-Type: application/json"
```

### API 2: Get Doctors by Department
```bash
curl -X GET "http://localhost:5000/api/doctors/department/CARD001" \
  -H "Content-Type: application/json"
```

### API 3: Get Doctors with Authentication
```bash
curl -X GET "http://localhost:5000/api/doctors/authenticated" \
  -H "Content-Type: application/json" \
  -H "Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## JavaScript Fetch Examples

### API 1: Get All Doctors (JSON)
```javascript
async function getAllDoctors() {
  try {
    const response = await fetch('http://localhost:5000/api/doctors/list-json', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Doctors:', data.data);
      return data.data;
    } else {
      console.error('Error:', data.message);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

getAllDoctors();
```

### API 2: Get Doctors by Department
```javascript
async function getDoctorsByDepartment(departmentId) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/doctors/department/${departmentId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    
    if (data.success) {
      console.log(`Doctors in ${departmentId}:`, data.data);
      console.log(`Total count: ${data.count}`);
      return data.data;
    } else {
      console.error('Error:', data.message);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// Usage
getDoctorsByDepartment('CARD001');
getDoctorsByDepartment('NEURO001');
```

### API 3: Get Doctors with Authentication
```javascript
// First, login to get the token
async function login(email, password) {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      }),
      credentials: 'include' // This sends cookies automatically
    });

    const data = await response.json();
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      return data.token;
    }
  } catch (error) {
    console.error('Login error:', error);
  }
}

// Then, use the token to access authenticated API
async function getAuthenticatedDoctors() {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch('http://localhost:5000/api/doctors/authenticated', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // This includes cookies automatically
      // Alternative: manually add token
      // headers: {
      //   'Content-Type': 'application/json',
      //   'Authorization': `Bearer ${token}`
      // }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Authenticated doctors:', data.data);
      console.log('Current user:', data.authenticatedUser);
      console.log('User role:', data.userRole);
      return data.data;
    } else {
      console.error('Error:', data.message);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// Usage
(async () => {
  // Step 1: Login
  await login('user@example.com', 'password123');
  
  // Step 2: Get authenticated doctors
  await getAuthenticatedDoctors();
})();
```

### With Axios (Alternative)
```javascript
// Install: npm install axios

import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/doctors';

// API 1: Get All Doctors
async function getAllDoctors() {
  try {
    const response = await axios.get(`${API_BASE}/list-json`);
    console.log('Doctors:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response.data.message);
  }
}

// API 2: Get Doctors by Department
async function getDoctorsByDepartment(departmentId) {
  try {
    const response = await axios.get(`${API_BASE}/department/${departmentId}`);
    console.log('Department Doctors:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response.data.message);
  }
}

// API 3: Get Authenticated Doctors
async function getAuthenticatedDoctors(token) {
  try {
    const response = await axios.get(`${API_BASE}/authenticated`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    });
    console.log('Authenticated Doctors:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response.data.message);
  }
}

// Usage
getAllDoctors();
getDoctorsByDepartment('CARD001');
getAuthenticatedDoctors('your_token_here');
```

---

## React Component Examples

### Hook to Fetch All Doctors
```javascript
import { useState, useEffect } from 'react';

function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/doctors/list-json');
        const data = await response.json();
        
        if (data.success) {
          setDoctors(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>All Doctors</h1>
      {doctors.map(doctor => (
        <div key={doctor._id}>
          <h2>{doctor.name}</h2>
          <p>Specialization: {doctor.specialization}</p>
          <p>Department: {doctor.department}</p>
        </div>
      ))}
    </div>
  );
}

export default DoctorsList;
```

### Hook to Fetch Doctors by Department
```javascript
import { useState, useEffect } from 'react';

function DepartmentDoctors({ departmentId }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/doctors/department/${departmentId}`
        );
        const data = await response.json();
        
        if (data.success) {
          setDoctors(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [departmentId]);

  if (loading) return <p>Loading doctors...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Doctors in {departmentId}</h1>
      <p>Total: {doctors.length}</p>
      {doctors.map(doctor => (
        <div key={doctor._id}>
          <h2>{doctor.name}</h2>
          <p>Specialization: {doctor.specialization}</p>
        </div>
      ))}
    </div>
  );
}

export default DepartmentDoctors;
```

### Hook for Authenticated Doctors (with Auth Context)
```javascript
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function AuthenticatedDoctors() {
  const { token } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/doctors/authenticated',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
          }
        );
        const data = await response.json();
        
        if (data.success) {
          setDoctors(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDoctors();
    }
  }, [token]);

  if (!token) return <p>Please login first</p>;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Doctors (Authenticated Access)</h1>
      <p>User ID: {doctors[0]?.userId}</p>
      {doctors.map(doctor => (
        <div key={doctor._id}>
          <h2>{doctor.name}</h2>
          <p>Experience: {doctor.Experience}</p>
        </div>
      ))}
    </div>
  );
}

export default AuthenticatedDoctors;
```

---

## Testing Checklist

- [ ] API 1 returns all doctors without authentication
- [ ] API 2 returns only doctors matching the department ID
- [ ] API 2 returns error when no departmentId provided
- [ ] API 3 requires authentication token
- [ ] API 3 returns "Unauthorized" without token
- [ ] All APIs return consistent JSON format
- [ ] Frontend can consume all three APIs
- [ ] Database has departments assigned to doctors
