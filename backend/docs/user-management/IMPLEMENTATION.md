# User Management APIs - Implementation Guide

## Overview

This document provides a comprehensive guide to the newly implemented User Management APIs for the School Management System. These APIs enable bulk import, creation, and management of users across different roles with full parent-student relationship mapping.

## What Was Implemented

### 1. **Service Layer** (`users.service.ts`)
Complete implementation of user management logic with:
- Single user creation methods for Students, Parents, Teachers, and Staff
- Bulk CSV import functionality for all user types
- Parent-to-student mapping (guardian relationships)
- User query and filtering capabilities
- User status management
- Transaction-safe operations using Prisma's `$transaction`
- Comprehensive error handling with detailed error messages

### 2. **Controller Layer** (`users.controller.ts`)
RESTful API endpoints with:
- Role-based access control using `@Roles()` decorator
- JWT authentication via `JwtAuthGuard`
- Swagger/OpenAPI documentation for all endpoints
- Detailed descriptions with examples for each endpoint
- Proper HTTP status codes and error handling

### 3. **Data Transfer Objects (DTOs)**
- `CreateStudentDto`: Single student creation
- `CreateParentDto`: Single parent creation
- `CreateTeacherDto`: Single teacher creation
- `CreateStaffDto`: Single staff member creation
- `ImportStudentDto`: CSV import for students
- `ImportParentDto`: CSV import for parents
- `ImportTeacherDto`: CSV import for teachers
- `ImportStaffDto`: CSV import for staff
- `QueryUsersDto`: User query with filtering
- `UserResponseDto`: Standardized user response
- `ImportResultDto`: Bulk import result with error tracking
- `MapParentToStudentsDto`: Parent-student mapping

### 4. **Features**

#### Single User Creation
- `POST /users/students` - Create individual student
- `POST /users/parents` - Create individual parent
- `POST /users/teachers` - Create individual teacher
- `POST /users/staff` - Create individual staff member

#### Bulk CSV Import
- `POST /users/import/students/csv` - Import multiple students
- `POST /users/import/parents/csv` - Import multiple parents
- `POST /users/import/teachers/csv` - Import multiple teachers
- `POST /users/import/staff/csv` - Import multiple staff members

**Features:**
- Transaction-safe batch operations
- Row-by-row error tracking with line numbers
- Detailed error messages for debugging
- Optional field handling
- CSV column flexibility

#### Parent-Student Mapping
- `PATCH /users/:parentId/map-students` - Map parent to multiple students
- Creates guardian relationships between parents and students
- Error handling for invalid parent/student IDs

#### User Querying
- `GET /users` - List all users with filtering and pagination
- `GET /users/:id` - Get user by ID
- `GET /users/class/:classId/students` - Get students in a class
- `GET /users/:parentId/children` - Get all children of a parent
- `GET /users/:studentId/guardian` - Get guardian of a student

#### User Management
- `PATCH /users/:userId/status` - Update user active/inactive status

### 5. **Security Features**
- **Password Hashing**: Bcrypt with 10 salt rounds
- **Role-Based Access Control**: Granular permissions per endpoint
- **Email Uniqueness**: Constraint-based enforcement
- **Input Validation**: Class-validator decorators on all DTOs
- **Transaction Safety**: Atomic operations for related data
- **JWT Authentication**: Bearer token required for all endpoints

### 6. **Error Handling**
Comprehensive error handling with appropriate HTTP status codes:
- `400 Bad Request`: Validation errors, CSV parsing failures
- `401 Unauthorized`: Missing/invalid authentication
- `403 Forbidden`: Insufficient role permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate email or constraint violations
- `500 Internal Server Error`: Unexpected errors

## Installation & Setup

### 1. Install Dependencies
```bash
npm install csv-parse
```

### 2. Import the Users Module
Add to your app module:
```typescript
import { UsersModule } from './module/users/users.module.js';

@Module({
  imports: [UsersModule, PrismaModule, AuthModule],
})
export class AppModule {}
```

### 3. Ensure JWT and Auth Guards are Set Up
The implementation requires:
- `JwtAuthGuard` - For authentication
- `RolesGuard` - For role-based authorization
- `@Roles()` decorator - For specifying required roles

## CSV Import Format

### Students
```csv
name,email,password,className,phone,rollNumber,admissionNumber,dob
John Doe,john@example.com,pass123,10-A,9876543210,1,ADM001,2008-05-15
```

**Required**: name, email, password, className
**Optional**: phone, rollNumber, admissionNumber, dob

### Parents
```csv
name,email,password,phone,relationship
Mr. Doe,parent@example.com,pass123,9876543210,Father
```

**Required**: name, email, password
**Optional**: phone, relationship

### Teachers
```csv
name,email,password,phone,employeeId,subjects,designation
Dr. Kumar,teacher@example.com,pass123,9876543210,EMP001,Math|Science,Senior Teacher
```

**Required**: name, email, password
**Optional**: phone, employeeId, subjects (use | or , separator), designation

### Staff
```csv
name,email,password,phone,employeeId,designation,department
Mr. Johnson,staff@example.com,pass123,9876543210,STAFF001,Manager,Administration
```

**Required**: name, email, password
**Optional**: phone, employeeId, designation, department

## API Examples

### Create a Student
```bash
POST /users/students
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "secure123",
  "classId": "uuid-of-class",
  "rollNumber": "1",
  "admissionNumber": "ADM001",
  "dob": "2008-05-15"
}
```

### Bulk Import Students
```bash
POST /users/import/students/csv
Authorization: Bearer <token>
Content-Type: application/json

{
  "csvData": "name,email,password,className\nJohn,john@example.com,pass123,10-A"
}
```

### Map Parent to Students
```bash
PATCH /users/parent-uuid/map-students
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentIds": ["student-uuid-1", "student-uuid-2"]
}
```

### Query Users
```bash
GET /users?role=STUDENT&classId=uuid&search=john&page=1&limit=20
Authorization: Bearer <token>
```

## File Structure

```
src/module/users/
├── dto/
│   ├── create-parent.dto.ts
│   ├── create-staff.dto.ts
│   ├── create-student.dto.ts
│   ├── create-teacher.dto.ts
│   ├── query-users.dto.ts
│   └── index.ts
├── users.controller.ts
├── users.service.ts
└── users.module.ts

docs/user-management/
├── API.md                 # Complete API documentation
├── QUICK_REFERENCE.md     # Quick reference guide
├── example_students.csv   # Example CSV file
├── example_parents.csv    # Example CSV file
├── example_teachers.csv   # Example CSV file
└── example_staff.csv      # Example CSV file
```

## Role Permissions

| Endpoint | ADMIN | PRINCIPAL | TEACHER | ADMISSION_COUNSELOR | PARENT | STUDENT |
|----------|-------|-----------|---------|-------------------|--------|---------|
| POST /users/students | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| POST /users/parents | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| POST /users/teachers | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| POST /users/staff | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| POST /users/import/* | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| PATCH /users/*/map-students | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| GET /users | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| GET /users/:id | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /users/class/*/students | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| GET /users/*/children | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| GET /users/*/guardian | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PATCH /users/*/status | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |

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
      "role": "STUDENT",
      "studentProfile": {
        "classId": "uuid",
        "rollNumber": "1"
      }
    }
  ]
}
```

## Best Practices

### 1. Testing Imports
- Start with small batches (5-10 records)
- Verify CSV format matches documentation
- Check error responses for data issues
- Review logs for detailed error information

### 2. Password Management
- Use strong, unique passwords for initial accounts
- Require password change on first login
- Implement password reset functionality

### 3. Data Validation
- Ensure class names match existing classes
- Validate email format and uniqueness
- Check phone numbers if required
- Verify date formats (ISO 8601)

### 4. Bulk Operations
- For large imports (>1000), consider chunking
- Monitor transaction logs for failures
- Implement retry logic for failed rows
- Keep audit logs of all imports

### 5. Relationship Management
- Verify parent and student IDs before mapping
- Handle multiple guardians per student if needed
- Update mappings when parents transfer
- Clean up orphaned relationships periodically

## Troubleshooting

### "Class not found" error
- Verify class exists: `GET /school-setup/classes`
- Check className matches exactly (case-sensitive)
- Create class first if missing

### "Email already exists" error
- Check if user already registered
- Use different email or update existing user
- Check for duplicate entries in CSV

### "Missing required fields" error
- Verify CSV header row
- Check for empty cells in required columns
- Ensure proper column order

### Permission denied (403)
- Verify user role has endpoint permission
- Check JWT token is valid
- Ensure token user role matches endpoint requirements

## Performance Considerations

1. **Batch Size**: Large imports (>500) may take time
2. **Database**: Transactional operations ensure consistency
3. **CSV Parsing**: Large files parsed in memory
4. **Email Uniqueness**: Index on email ensures fast lookups

## Future Enhancements

1. **File Upload**: Accept file uploads instead of raw CSV data
2. **Async Processing**: Queue large imports for background processing
3. **Duplicate Detection**: Detect and handle duplicate emails gracefully
4. **Bulk Updates**: Update user information in bulk
5. **Export to CSV**: Export user data in CSV format
6. **Audit Logging**: Track all user management operations
7. **Profile Pictures**: Support avatar uploads
8. **Additional Validations**: Phone number, date of birth validation

## Documentation Files

- `API.md` - Complete API reference with all endpoints
- `QUICK_REFERENCE.md` - Quick reference guide with curl examples
- `example_*.csv` - Sample CSV files for each user type

## Testing

To test the implementation:

1. Get a valid JWT token from `/auth/login`
2. Use the token in `Authorization: Bearer <token>` header
3. Start with single user creation endpoints
4. Test CSV import with small batches
5. Verify relationships using GET endpoints
6. Check error handling with invalid data

## Support & Maintenance

For issues:
1. Check API documentation
2. Review error messages in response
3. Check system logs for details
4. Verify CSV format
5. Ensure user has proper role permissions

## Summary

The User Management APIs provide a complete, production-ready solution for:
- ✅ Single and bulk user creation
- ✅ CSV import with error tracking
- ✅ Parent-student relationship management
- ✅ User querying and filtering
- ✅ Role-based access control
- ✅ Comprehensive error handling
- ✅ Transaction safety and data consistency
