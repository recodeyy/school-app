# User Management API Documentation

## Overview

The User Management APIs provide comprehensive functionality for managing users across different roles:

- **STUDENT**: Students enrolled in classes
- **PARENT**: Parents/guardians of students
- **TEACHER**: Teaching staff
- **STAFF**: Administrative and support staff (mapped to ADMIN role)
- **ADMIN**: School administrators
- **PRINCIPAL**: School principal
- **ADMISSION_COUNSELOR**: Admission counselor

## Features

✅ Single user creation for each role
✅ Bulk import via CSV for students, parents, teachers, and staff
✅ Parent-to-student mapping (guardian relationships)
✅ User querying with filtering and pagination
✅ Role-based access control (RBAC)
✅ Password hashing with bcrypt
✅ Comprehensive error handling with detailed error messages

## Endpoints

### Single User Creation

#### Create Student

```
POST /users/students
Authorization: Bearer <token>
Roles: ADMIN, PRINCIPAL, ADMISSION_COUNSELOR

Request Body:
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "9876543210",
  "password": "secure_password_123",
  "classId": "uuid-of-class",
  "rollNumber": "1",
  "admissionNumber": "ADM001",
  "dob": "2008-05-15"
}
```

#### Create Parent

```
POST /users/parents
Authorization: Bearer <token>
Roles: ADMIN, PRINCIPAL, ADMISSION_COUNSELOR

Request Body:
{
  "name": "Mr. John Doe",
  "email": "john.parent@example.com",
  "phone": "9876543210",
  "password": "secure_password_123",
  "relationship": "Father"
}
```

#### Create Teacher

```
POST /users/teachers
Authorization: Bearer <token>
Roles: ADMIN, PRINCIPAL, ADMISSION_COUNSELOR

Request Body:
{
  "name": "Dr. Kumar",
  "email": "kumar@example.com",
  "phone": "9876543210",
  "password": "secure_password_123",
  "employeeId": "EMP001",
  "subjects": ["Mathematics", "Physics"],
  "designation": "Senior Teacher"
}
```

#### Create Staff

```
POST /users/staff
Authorization: Bearer <token>
Roles: ADMIN, PRINCIPAL

Request Body:
{
  "name": "Mr. Johnson",
  "email": "johnson@example.com",
  "phone": "9876543210",
  "password": "secure_password_123",
  "employeeId": "STAFF001",
  "designation": "Office Manager",
  "department": "Administration",
  "role": "ADMIN"  // Optional: ADMIN, TEACHER, etc. Defaults to ADMIN
}
```

### Bulk Import from CSV

#### Import Students

```
POST /users/import/students/csv
Authorization: Bearer <token>
Roles: ADMIN, PRINCIPAL, ADMISSION_COUNSELOR

Request Body:
{
  "csvData": "name,email,password,className,phone,rollNumber,admissionNumber,dob\nJohn Doe,john@example.com,pass123,10-A,9876543210,1,ADM001,2008-05-15\nJane Smith,jane@example.com,pass456,10-A,9876543211,2,ADM002,2008-06-20"
}

Response:
{
  "success": 2,
  "failed": 0,
  "createdUsers": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "STUDENT",
      "studentProfile": {
        "classId": "uuid",
        "rollNumber": "1",
        "admissionNumber": "ADM001"
      }
    }
  ]
}
```

#### Import Parents

```
POST /users/import/parents/csv
Authorization: Bearer <token>
Roles: ADMIN, PRINCIPAL, ADMISSION_COUNSELOR

Request Body:
{
  "csvData": "name,email,password,phone,relationship\nMr. Doe,parent1@example.com,pass123,9876543210,Father\nMrs. Smith,parent2@example.com,pass456,9876543211,Mother"
}
```

#### Import Teachers

```
POST /users/import/teachers/csv
Authorization: Bearer <token>
Roles: ADMIN, PRINCIPAL

Request Body:
{
  "csvData": "name,email,password,phone,employeeId,subjects,designation\nDr. Kumar,teacher1@example.com,pass123,9876543210,EMP001,Math|Science,Senior Teacher\nMs. Sharma,teacher2@example.com,pass456,9876543211,EMP002,English|History,Teacher"
}

Note: Subjects can be separated by comma (,) or pipe (|)
```

#### Import Staff

```
POST /users/import/staff/csv
Authorization: Bearer <token>
Roles: ADMIN, PRINCIPAL

Request Body:
{
  "csvData": "name,email,password,phone,employeeId,designation,department\nMr. Johnson,staff1@example.com,pass123,9876543210,STAFF001,Office Manager,Administration\nMs. Patel,staff2@example.com,pass456,9876543211,STAFF002,Lab Assistant,Science Lab"
}
```

### Parent-Student Mapping

#### Map Parent to Students

```
PATCH /users/:parentId/map-students
Authorization: Bearer <token>
Roles: ADMIN, PRINCIPAL, ADMISSION_COUNSELOR

Request Body:
{
  "studentIds": ["student-uuid-1", "student-uuid-2", "student-uuid-3"]
}

Response:
{
  "success": 3,
  "failed": 0
}
```

### Query Users

#### Get All Users (with filtering)

```
GET /users?role=STUDENT&classId=uuid&search=john&page=1&limit=20
Authorization: Bearer <token>
Roles: ADMIN, PRINCIPAL, TEACHER, ADMISSION_COUNSELOR

Query Parameters:
- role: Filter by user role (STUDENT, TEACHER, PARENT, ADMIN, etc.)
- classId: Filter students by class UUID
- search: Search by name or email (case-insensitive)
- page: Page number (default: 1)
- limit: Items per page (default: 20)

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "role": "STUDENT",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "studentProfile": {
        "classId": "uuid",
        "rollNumber": "1",
        "admissionNumber": "ADM001"
      }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20
  }
}
```

#### Get User by ID

```
GET /users/:id
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "role": "STUDENT",
  "avatarUrl": null,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "studentProfile": {
    "classId": "uuid",
    "rollNumber": "1",
    "admissionNumber": "ADM001",
    "guardianId": "parent-uuid"
  }
}
```

#### Get Students in a Class

```
GET /users/class/:classId/students
Authorization: Bearer <token>
Roles: ADMIN, PRINCIPAL, TEACHER, ADMISSION_COUNSELOR

Response: Array of UserResponseDto
```

#### Get Parent's Children

```
GET /users/:parentId/children
Authorization: Bearer <token>
Roles: ADMIN, PRINCIPAL, PARENT, ADMISSION_COUNSELOR

Response: Array of UserResponseDto for students associated with the parent
```

#### Get Student's Guardian

```
GET /users/:studentId/guardian
Authorization: Bearer <token>
Roles: ADMIN, PRINCIPAL, STUDENT, PARENT, ADMISSION_COUNSELOR

Response: UserResponseDto of the student's parent/guardian or null
```

### User Status Management

#### Update User Status

```
PATCH /users/:userId/status
Authorization: Bearer <token>
Roles: ADMIN, PRINCIPAL, ADMISSION_COUNSELOR

Request Body:
{
  "isActive": false
}

Response: Updated UserResponseDto
```

## CSV File Formats

### Students CSV

```
name,email,password,className,phone,rollNumber,admissionNumber,dob
John Doe,john@example.com,pass123,10-A,9876543210,1,ADM001,2008-05-15
Jane Smith,jane@example.com,pass456,10-A,9876543211,2,ADM002,2008-06-20
Alex Kumar,alex@example.com,pass789,10-B,9876543212,1,ADM003,2008-07-25
```

**Required Fields**: name, email, password, className
**Optional Fields**: phone, rollNumber, admissionNumber, dob
**Notes**:

- className must match an existing class name in the system
- dob should be in ISO 8601 format (YYYY-MM-DD)

### Parents CSV

```
name,email,password,phone,relationship
Mr. Doe,parent1@example.com,pass123,9876543210,Father
Mrs. Smith,parent2@example.com,pass456,9876543211,Mother
Mr. Kumar,parent3@example.com,pass789,9876543212,Guardian
```

**Required Fields**: name, email, password
**Optional Fields**: phone, relationship
**Notes**:

- relationship can be: Father, Mother, Guardian, etc.

### Teachers CSV

```
name,email,password,phone,employeeId,subjects,designation
Dr. Kumar,teacher1@example.com,pass123,9876543210,EMP001,Math|Science,Senior Teacher
Ms. Sharma,teacher2@example.com,pass456,9876543211,EMP002,English|History,Teacher
Mr. Patel,teacher3@example.com,pass789,9876543212,EMP003,Hindi|Sanskrit,HOD
```

**Required Fields**: name, email, password
**Optional Fields**: phone, employeeId, subjects, designation
**Notes**:

- subjects can be separated by comma (,) or pipe (|)
- designation examples: Senior Teacher, HOD, Assistant Principal

### Staff CSV

```
name,email,password,phone,employeeId,designation,department,role
Mr. Johnson,staff1@example.com,pass123,9876543210,STAFF001,Office Manager,Administration,ADMIN
Ms. Patel,staff2@example.com,pass456,9876543211,STAFF002,Lab Assistant,Science Lab,TEACHER
Mr. Singh,staff3@example.com,pass789,9876543212,STAFF003,Counselor,Student Services,ADMIN
```

**Required Fields**: name, email, password
**Optional Fields**: phone, employeeId, designation, department, role
**Notes**:

- department examples: Administration, Science Lab, Student Services, etc.
- role examples: ADMIN (default), TEACHER, PRINCIPAL, ADMISSION_COUNSELOR
- If role is not provided, defaults to ADMIN

## Import Results

When importing users in bulk, the response includes:

```json
{
  "success": 95,
  "failed": 5,
  "errors": [
    {
      "rowNumber": 3,
      "email": "duplicate@example.com",
      "error": "User with email duplicate@example.com already exists"
    },
    {
      "rowNumber": 7,
      "email": "invalid@class.com",
      "error": "Class \"11-Z\" not found"
    }
  ],
  "createdUsers": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "STUDENT"
    }
  ]
}
```

- `success`: Number of users successfully created
- `failed`: Number of users that failed to create
- `errors`: Detailed error messages for each failed row
- `createdUsers`: Array of successfully created user objects (when applicable)

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200 OK**: Successful request
- **400 Bad Request**: Invalid request body or CSV parsing error
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User role doesn't have permission for this action
- **404 Not Found**: Resource not found (user, class, etc.)
- **409 Conflict**: Email already exists or duplicate constraint violated
- **500 Internal Server Error**: Unexpected server error

## Security Considerations

1. **Password Hashing**: All passwords are hashed using bcrypt (salt rounds: 10)
2. **Role-Based Access Control**: Endpoints are protected by role-based guards
3. **Email Validation**: Email addresses are validated and must be unique
4. **Input Validation**: All inputs are validated using class-validator
5. **Transaction Safety**: User and profile creation are transactional for data consistency

## Bulk Import Best Practices

1. **Validate CSV Format**: Ensure all required columns are present
2. **Test with Small Batch**: Import a few records first to verify data format
3. **Check Logs**: Review error messages for any data issues
4. **Retry Failed Records**: Fix issues and re-import failed records
5. **Verify After Import**: Query the system to verify data was imported correctly

## Example: Complete Workflow

### Step 1: Create a class (via school-setup API)

```bash
POST /school-setup/classes
{
  "name": "10-A",
  "academicYear": "2024-2025"
}
Response: { "id": "class-uuid", "name": "10-A" }
```

### Step 2: Import students

```bash
POST /users/import/students/csv
{
  "csvData": "name,email,password,className\nJohn,john@example.com,pass123,10-A"
}
```

### Step 3: Import parents

```bash
POST /users/import/parents/csv
{
  "csvData": "name,email,password\nMr. Doe,parent@example.com,pass123"
}
Response: { "success": 1, "failed": 0, "createdUsers": [{ "id": "parent-uuid" }] }
```

### Step 4: Map parent to student

```bash
PATCH /users/parent-uuid/map-students
{
  "studentIds": ["student-uuid"]
}
Response: { "success": 1, "failed": 0 }
```

### Step 5: Verify relationships

```bash
GET /users/student-uuid/guardian
Response: { "id": "parent-uuid", "name": "Mr. Doe", "role": "PARENT" }

GET /users/parent-uuid/children
Response: [{ "id": "student-uuid", "name": "John", "role": "STUDENT" }]
```

## Support

For issues or questions:

- Check error messages in the response
- Verify CSV format matches documentation
- Ensure user has appropriate role permissions
- Contact system administrator for permission issues
