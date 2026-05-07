# API Test Report

Generated on: 7/5/2026, 4:00:55 pm

This report contains the automated test results for the newly created School Management System APIs.

## Authentication & Seeding
- Successfully seeded Admin, Teacher, Parent, Student users.
- Successfully logged in and retrieved JWT tokens for all roles.

### 1. School Setup API
- **Create Class**: ✅ PASS ({"id":"ffe51700-cadc-46c0-9f84-71a5249e093b","name":"Test Class X","academicYear":"2026","academicYearId":null,"classTeacherId":null,"createdAt":"2026-05-07T10:31:01.234Z"})
- **Create Subject**: ✅ PASS ({"id":"311e4023-ef60-4d59-b1d1-b4bc4cedeba9","name":"Test Subject Math","code":"MATH101","classId":"ffe51700-cadc-46c0-9f84-71a5249e093b","teacherId":"15ae54b7-1afc-47ee-9964-4031009b45d5"})

### 2. Attendance API
- **Mark Attendance**: ✅ PASS ({"id":"54c3e9a9-45ad-4f80-b599-e0ef5c8ea73f","classId":"ffe51700-cadc-46c0-9f84-71a5249e093b","subjectId":"311e4023-ef60-4d59-b1d1-b4bc4cedeba9","teacherId":"15ae54b7-1afc-47ee-9964-4031009b45d5","date":"2026-05-08T00:00:00.000Z","startTime":"1970-01-01T09:00:00.000Z","createdAt":"2026-05-07T10:31:06.925Z","records":[{"id":"ff0baefd-452f-45ec-9829-a2f61a80886b","sessionId":"54c3e9a9-45ad-4f80-b599-e0ef5c8ea73f","studentId":"2b6d447d-a91e-45ec-8c4b-3683f1f224d3","status":"PRESENT","markedAt":"2026-05-07T10:31:07.138Z","note":"On time","student":{"id":"2b6d447d-a91e-45ec-8c4b-3683f1f224d3","name":"Student Test","email":"testapi_student@example.com"}}],"subject":{"id":"311e4023-ef60-4d59-b1d1-b4bc4cedeba9","name":"Test Subject Math"},"schoolClass":{"id":"ffe51700-cadc-46c0-9f84-71a5249e093b","name":"Test Class X"},"teacher":{"id":"15ae54b7-1afc-47ee-9964-4031009b45d5","name":"Teacher Test"}})
- **Student Views Attendance**: ✅ PASS (Records found: 1)

### 3. Homework API
- **Create Homework**: ✅ PASS ({"id":"cc412c4c-8878-4e71-96d7-f2c31993569a","title":"Algebra Worksheet","description":"Do problems 1-10","classId":"ffe51700-cadc-46c0-9f84-71a5249e093b","subjectId":"311e4023-ef60-4d59-b1d1-b4bc4cedeba9","createdById":"15ae54b7-1afc-47ee-9964-4031009b45d5","dueDate":"2026-05-15T00:00:00.000Z","attachments":null,"isPublished":true,"createdAt":"2026-05-07T10:31:11.776Z","subject":{"id":"311e4023-ef60-4d59-b1d1-b4bc4cedeba9","name":"Test Subject Math"},"schoolClass":{"id":"ffe51700-cadc-46c0-9f84-71a5249e093b","name":"Test Class X"},"createdBy":{"id":"15ae54b7-1afc-47ee-9964-4031009b45d5","name":"Teacher Test"}})
- **Submit Homework**: ✅ PASS ({"id":"100c25d7-0223-491e-8197-db727b7d61b4","homeworkId":"cc412c4c-8878-4e71-96d7-f2c31993569a","studentId":"2b6d447d-a91e-45ec-8c4b-3683f1f224d3","status":"SUBMITTED","content":"Here are my answers","attachments":null,"grade":null,"feedback":null,"submittedAt":"2026-05-07T10:31:15.385Z","gradedAt":null,"createdAt":"2026-05-07T10:31:15.389Z"})
- **Grade Homework**: ✅ PASS

### 4. Marks & Results API
- **Create Exam**: ✅ PASS ({"id":"9c651346-6f07-416d-a62a-c47d520f1c95","name":"Mid-Term 2026","classId":"ffe51700-cadc-46c0-9f84-71a5249e093b","type":"MIDTERM","totalMarks":"100","examDate":"2026-05-20T00:00:00.000Z","isPublished":false,"schoolClass":{"id":"ffe51700-cadc-46c0-9f84-71a5249e093b","name":"Test Class X"}})
- **Upload Marks**: ✅ PASS
- **Publish Results**: ✅ PASS
- **Student Views Results**: ✅ PASS (Found: 1)

### 5. Notices API
- **Create Notice**: ✅ PASS
- **List Notices (Student View)**: ✅ PASS (Found: 1)

### 6. Fees API
- **Create Fee**: ✅ PASS ({"id":"6776de23-ab2b-4860-8d21-d64ccb4616b1","studentId":"2b6d447d-a91e-45ec-8c4b-3683f1f224d3","title":"Term 1 Fee","description":null,"amount":"5000","dueDate":"2026-05-30T00:00:00.000Z","status":"PENDING","paidAmount":"0","createdAt":"2026-05-07T10:31:29.485Z","student":{"id":"2b6d447d-a91e-45ec-8c4b-3683f1f224d3","name":"Student Test","email":"testapi_student@example.com"}})
- **Record Payment**: ✅ PASS ({"id":"fa758a33-ec35-453d-b7c6-feb00a27a7a2","feeId":"6776de23-ab2b-4860-8d21-d64ccb4616b1","amount":"2500","paymentMethod":"ONLINE","transactionId":null,"recordedById":"9cb39a2e-20c5-48fd-989d-6b10156cbea8","paidAt":"2026-05-07T10:31:31.978Z"})
- **Parent Views Fees**: ✅ PASS

### 7. Dashboards API
- **Admin Dashboard**: ✅ PASS
- **Teacher Dashboard**: ✅ PASS
- **Student Dashboard**: ✅ PASS
- **Parent Dashboard**: ✅ PASS

### 8. Notifications API
- **Student Unread Notifications Count**: ✅ PASS (Count: 6)
- **List Student Notifications**: ✅ PASS (Found: 6)

