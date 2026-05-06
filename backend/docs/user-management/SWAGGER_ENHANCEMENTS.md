# Swagger Documentation Enhancement

## Overview

Comprehensive Swagger/OpenAPI documentation has been added to the Users Controller with detailed endpoint descriptions, request/response examples, and error responses.

## What Was Added

### 1. **Import Enhancements**
Added multiple Swagger decorators for better documentation:
- `@ApiCreatedResponse` - For POST endpoints returning 201
- `@ApiBadRequestResponse` - For validation errors
- `@ApiConflictResponse` - For duplicate email conflicts
- `@ApiForbiddenResponse` - For permission denied errors
- `@ApiNotFoundResponse` - For resource not found errors
- `@ApiParam` - For path parameter documentation
- `@ApiQuery` - For query parameter documentation
- `@ApiUnauthorizedResponse` - For authentication errors

### 2. **Endpoint Documentation**

#### User Creation Endpoints (4)
All creation endpoints now include:
- ✅ Detailed operation descriptions
- ✅ Success response (201 Created)
- ✅ Error responses (400, 409, 403)
- ✅ Parameter descriptions

Examples:
- `POST /users/students` - With class requirement details
- `POST /users/parents` - With parent-specific info
- `POST /users/teachers` - With subject support info
- `POST /users/staff` - With role assignment details

#### Bulk Import Endpoints (4)
Enhanced with:
- ✅ CSV format requirements
- ✅ Required vs optional columns
- ✅ Success and failure response format
- ✅ Error handling documentation

Examples:
- `POST /users/import/students/csv`
- `POST /users/import/parents/csv`
- `POST /users/import/teachers/csv` - With subject format info
- `POST /users/import/staff/csv` - With valid roles documentation

#### Parent-Student Mapping
- ✅ Parameter documentation with example UUID
- ✅ Success/failure count response
- ✅ Error scenarios documented

#### Query Endpoints (5)
Enhanced with:
- ✅ Query parameter documentation with examples
- ✅ Filter capabilities (role, classId, search)
- ✅ Pagination support (page, limit)
- ✅ Response format documentation

All GET endpoints now have:
- `@ApiParam` - For path parameters (with example UUIDs)
- `@ApiQuery` - For optional query parameters
- Descriptions of filter options

#### Status Management
- ✅ User deactivation details
- ✅ Effect on login capability
- ✅ Error scenarios

## Example: User Creation Endpoint

```typescript
@Post('students')
@Roles('ADMIN', 'PRINCIPAL', 'ADMISSION_COUNSELOR')
@ApiOperation({
  summary: 'Create a single student',
  description: 'Add a new student user account with student profile and assign to a class',
})
@ApiCreatedResponse({
  type: UserResponseDto,
  description: 'Student created successfully',
})
@ApiBadRequestResponse({
  description: 'Invalid input data or class not found',
})
@ApiConflictResponse({
  description: 'Email already exists',
})
@ApiForbiddenResponse({
  description: 'User role does not have permission',
})
```

## Example: Query Parameters Documentation

```typescript
@ApiQuery({
  name: 'role',
  required: false,
  description: 'Filter by user role (ADMIN, TEACHER, STUDENT, PARENT, etc.)',
  example: 'STUDENT',
})
@ApiQuery({
  name: 'page',
  required: false,
  description: 'Page number (default: 1)',
  example: '1',
})
@ApiQuery({
  name: 'limit',
  required: false,
  description: 'Items per page (default: 20)',
  example: '20',
})
```

## Example: Path Parameters Documentation

```typescript
@Get(':id')
@ApiParam({
  name: 'id',
  description: 'User UUID',
  example: '550e8400-e29b-41d4-a716-446655440000',
})
@ApiOkResponse({
  type: UserResponseDto,
  description: 'User details',
})
@ApiNotFoundResponse({
  description: 'User not found',
})
```

## Swagger Response Types

### Success Responses
- **201 Created** - For POST endpoints (user/staff creation)
- **200 OK** - For GET/PATCH endpoints
- Includes `type` and `description` for clarity

### Error Responses Documented
- **400 Bad Request** - Invalid input or CSV format
- **401 Unauthorized** - Missing/invalid token
- **403 Forbidden** - Insufficient role permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Email already exists

## CSV Import Documentation

Each import endpoint now clearly documents:
- Required columns
- Optional columns
- Valid values (e.g., role options for staff)
- Return format with success/failure counts
- Per-row error tracking

Example (Staff Import):
```
Required: name, email, password
Optional: phone, employeeId, designation, department, role
Valid roles: ADMIN (default), TEACHER, ADMISSION_COUNSELOR
```

## Query Parameter Documentation

The GET endpoints include comprehensive query parameter docs:
- **role** - Filter by user role with examples
- **classId** - Filter students by class UUID
- **search** - Search by name or email
- **page** - Pagination with default value
- **limit** - Items per page with default value

All with example values and descriptions.

## Parameter Examples in Swagger

All path parameters now include example UUIDs:
```
550e8400-e29b-41d4-a716-446655440000
```

## Benefits

✅ **Better API Discovery** - Clear endpoint descriptions
✅ **Reduced Documentation** - Swagger docs are self-documenting
✅ **Error Handling** - All error scenarios documented
✅ **Example Values** - UUID examples for parameters
✅ **Query Support** - Filter/pagination options clear
✅ **CSV Format** - Import requirements explicit
✅ **Role Restrictions** - Permission requirements visible
✅ **Type Safety** - Response types documented

## Accessing Swagger Documentation

The Swagger UI is available at:
```
http://localhost:3000/api/docs
```

All 18 endpoints are fully documented with:
- Request/response schemas
- Parameter descriptions
- Error responses
- Example values
- Permission requirements

## Next Steps

The Swagger documentation is production-ready and provides:
1. **Immediate value** for frontend developers
2. **Clear API contracts** for integration
3. **Self-documenting** error scenarios
4. **Complete parameter documentation**

All endpoints can now be tested directly in Swagger UI with actual request/response examples!

---

**Status**: ✅ Complete - All endpoints fully documented in Swagger/OpenAPI
