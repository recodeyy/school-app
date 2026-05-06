# User Management API - Quick Reference

## Authentication

All endpoints require JWT authentication with `Authorization: Bearer <token>` header.

## Roles Required

- **ADMIN**: Full access to all user management operations
- **PRINCIPAL**: Full access to user management
- **ADMISSION_COUNSELOR**: Can create/import users and manage mappings
- **TEACHER**: Can view users and students in their classes

## Quick Examples

### 1. Create a Student

```bash
curl -X POST http://localhost:3000/api/users/students \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "SecurePassword123",
    "classId": "class-uuid-here",
    "rollNumber": "1",
    "admissionNumber": "ADM001",
    "dob": "2008-05-15"
  }'
```

### 2. Import Students from CSV

```bash
curl -X POST http://localhost:3000/api/users/import/students/csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "csvData": "name,email,password,className,phone,rollNumber,admissionNumber,dob\nJohn Doe,john@example.com,pass123,10-A,9876543210,1,ADM001,2008-05-15\nJane Smith,jane@example.com,pass456,10-A,9876543211,2,ADM002,2008-06-20"
  }'
```

### 3. Create a Parent

```bash
curl -X POST http://localhost:3000/api/users/parents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mr. John Doe",
    "email": "parent@example.com",
    "phone": "9876543210",
    "password": "SecurePassword123",
    "relationship": "Father"
  }'
```

### 4. Map Parent to Students

```bash
curl -X PATCH http://localhost:3000/api/users/parent-uuid/map-students \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentIds": ["student-uuid-1", "student-uuid-2"]
  }'
```

### 5. Query All Users

```bash
# Get all students in a class
curl -X GET "http://localhost:3000/api/users?role=STUDENT&classId=class-uuid&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search by name
curl -X GET "http://localhost:3000/api/users?search=john&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Get User by ID

```bash
curl -X GET http://localhost:3000/api/users/user-uuid \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Get Parent's Children

```bash
curl -X GET http://localhost:3000/api/users/parent-uuid/children \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 8. Get Student's Guardian

```bash
curl -X GET http://localhost:3000/api/users/student-uuid/guardian \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 9. Update User Status

```bash
curl -X PATCH http://localhost:3000/api/users/user-uuid/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

### 10. Get Students in a Class

```bash
curl -X GET http://localhost:3000/api/users/class/class-uuid/students \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## CSV Import Format Guide

### Students

```
name,email,password,className,phone,rollNumber,admissionNumber,dob
John Doe,john@example.com,pass123,10-A,9876543210,1,ADM001,2008-05-15
```

- Required: name, email, password, className
- Optional: phone, rollNumber, admissionNumber, dob

### Parents

```
name,email,password,phone,relationship
Mr. Doe,parent@example.com,pass123,9876543210,Father
```

- Required: name, email, password
- Optional: phone, relationship

### Teachers

```
name,email,password,phone,employeeId,subjects,designation
Dr. Kumar,teacher@example.com,pass123,9876543210,EMP001,Math|Physics,Senior Teacher
```

- Required: name, email, password
- Optional: phone, employeeId, subjects (use | or , separator), designation
- Subjects: Pipe (|) or comma (,) separated

### Staff

```
name,email,password,phone,employeeId,designation,department,role
Mr. Johnson,staff@example.com,pass123,9876543210,STAFF001,Manager,Admin,ADMIN
```

- Required: name, email, password
- Optional: phone, employeeId, designation, department, role
- role options (default: ADMIN): ADMIN, TEACHER, ADMISSION_COUNSELOR
- Only these three roles are allowed for staff members

## Response Codes

| Code | Meaning                                     |
| ---- | ------------------------------------------- |
| 200  | Success                                     |
| 400  | Bad request (validation error, invalid CSV) |
| 401  | Unauthorized (missing or invalid token)     |
| 403  | Forbidden (insufficient permissions)        |
| 404  | Not found (user, class, etc.)               |
| 409  | Conflict (duplicate email)                  |
| 500  | Server error                                |

## Import Response Format

```json
{
  "success": 95,
  "failed": 5,
  "errors": [
    {
      "rowNumber": 3,
      "email": "duplicate@example.com",
      "error": "User with email duplicate@example.com already exists"
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

## Workflow Example: Setting Up Students with Parents

### 1. First, create classes (via school-setup API if needed)

```bash
POST /school-setup/classes
{
  "name": "10-A",
  "academicYear": "2024-2025"
}
```

### 2. Import students

```bash
POST /users/import/students/csv
{
  "csvData": "name,email,password,className\nJohn,john@example.com,pass123,10-A"
}
# Response includes created student IDs
```

### 3. Import parents

```bash
POST /users/import/parents/csv
{
  "csvData": "name,email,password\nMr. Doe,parent@example.com,pass123"
}
# Response includes created parent ID
```

### 4. Map parents to students

```bash
PATCH /users/{parent-id}/map-students
{
  "studentIds": ["student-id-1", "student-id-2"]
}
```

### 5. Verify relationships

```bash
# Check student's parent
GET /users/{student-id}/guardian

# Check parent's children
GET /users/{parent-id}/children
```

## Common Issues

### "Class not found" error

- Ensure the class exists in the system
- Verify className matches exactly (case-sensitive)

### "Email already exists" error

- The email is already registered in the system
- Use a different email or update existing user

### "Missing required fields" error

- Check CSV has all required columns
- Verify no empty values in required fields

### Permission denied (403)

- Check your user role has permission
- Student users cannot create other users
- TEACHER cannot create staff

### CSV parsing error (400)

- Verify CSV format is correct
- Check for special characters in data
- Ensure proper escaping if using quotes

## Tips

1. **Test First**: Import a small batch (5-10 records) first to verify data
2. **Email Validation**: Emails must be unique and valid format
3. **Password Security**: Use strong passwords for initial accounts
4. **Batch Operations**: For large imports, consider splitting into smaller batches
5. **Error Review**: Check error messages carefully for specific issues
6. **Verify After Import**: Query the system to confirm data

## Support

For issues, check:

- API documentation in `docs/user-management/API.md`
- Example CSV files in `docs/user-management/`
- System logs for detailed error information
