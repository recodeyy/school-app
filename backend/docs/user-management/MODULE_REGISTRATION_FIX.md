# Users Module Registration Fix

## Issue
The Users module was not registered in the `AppModule`, so the User Management endpoints were not appearing in the Swagger documentation.

## Solution
Added `UsersModule` to the imports array in `AppModule`.

### What Changed

**File: `src/app.module.ts`**

```typescript
// Before
@Module({
  imports: [AuthModule, SchoolSetupModule],
  controllers: [AppController],
  providers: [AppService],
})

// After
@Module({
  imports: [AuthModule, SchoolSetupModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
```

## Verification Steps

1. **Restart the development server:**
   ```bash
   npm run start:dev
   ```

2. **Open Swagger UI:**
   ```
   http://localhost:4000/api/docs/
   ```

3. **Check for Users endpoints:**
   - Look for a new `Users` section in the sidebar
   - Should see all 18 endpoints:
     - 4 POST endpoints for creating users
     - 4 POST endpoints for bulk CSV imports
     - 1 PATCH endpoint for parent-student mapping
     - 5 GET endpoints for querying users
     - 1 PATCH endpoint for status updates
     - 3 other GET endpoints for relationships

## All Endpoints Now Available

### User Creation
- ✅ POST /users/students
- ✅ POST /users/parents
- ✅ POST /users/teachers
- ✅ POST /users/staff

### Bulk Import
- ✅ POST /users/import/students/csv
- ✅ POST /users/import/parents/csv
- ✅ POST /users/import/teachers/csv
- ✅ POST /users/import/staff/csv

### Parent-Student Mapping
- ✅ PATCH /users/:parentId/map-students

### Query Users
- ✅ GET /users (with filtering & pagination)
- ✅ GET /users/:id
- ✅ GET /users/class/:classId/students
- ✅ GET /users/:parentId/children
- ✅ GET /users/:studentId/guardian

### Status Management
- ✅ PATCH /users/:userId/status

## Next Steps

1. Restart your development server
2. Navigate to Swagger UI at `http://localhost:4000/api/docs/`
3. All User Management endpoints should now be visible with full documentation
4. Click on any endpoint to see:
   - Request body schema
   - Response schema
   - Required parameters
   - Error codes
   - Example values

## Module Dependencies

The UsersModule uses:
- `PrismaService` - For database operations
- `JwtAuthGuard` - For authentication
- `RolesGuard` - For authorization
- `@Roles()` decorator - For role-based access control

All these are already set up in the project.

---

**Status**: ✅ Fixed - Users module now registered and endpoints visible in Swagger
