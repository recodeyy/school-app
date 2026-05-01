-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "tenant";

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('starter', 'pro', 'enterprise');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'teacher', 'student', 'parent');

-- CreateEnum
CREATE TYPE "WeekType" AS ENUM ('every', 'odd', 'even');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('present', 'absent', 'late', 'excused');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('unit', 'midterm', 'final', 'practical', 'assignment');

-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('class', 'subject', 'custom', 'announcement');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'image', 'file', 'announcement');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "plan" "Plan" NOT NULL,
    "storage_used_mb" BIGINT NOT NULL DEFAULT 0,
    "storage_limit_mb" BIGINT NOT NULL DEFAULT 5120,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "schema_name" VARCHAR(100) NOT NULL,
    "billing_email" VARCHAR(255),

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "plan" "Plan" NOT NULL,
    "price_monthly" DECIMAL(10,2) NOT NULL,
    "storage_gb" INTEGER NOT NULL,
    "valid_until" DATE,
    "payment_gateway_id" VARCHAR(200),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "avatar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."classes" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "academic_year" VARCHAR(20) NOT NULL,
    "class_teacher_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."student_profiles" (
    "user_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "roll_number" VARCHAR(50),
    "admission_number" VARCHAR(100),
    "dob" DATE,
    "guardian_id" UUID,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "tenant"."teacher_profiles" (
    "user_id" UUID NOT NULL,
    "employee_id" VARCHAR(100),
    "subjects" TEXT[],
    "designation" VARCHAR(100),

    CONSTRAINT "teacher_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "tenant"."subjects" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(50),
    "class_id" UUID NOT NULL,
    "teacher_id" UUID,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."timetable_slots" (
    "id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "day_of_week" SMALLINT NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "room" VARCHAR(100),
    "week_type" "WeekType" NOT NULL DEFAULT 'every',

    CONSTRAINT "timetable_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."attendance_sessions" (
    "id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."attendance_records" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "marked_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."exams" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "class_id" UUID NOT NULL,
    "type" "ExamType" NOT NULL,
    "total_marks" DECIMAL(6,2) NOT NULL,
    "exam_date" DATE NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."results" (
    "id" UUID NOT NULL,
    "exam_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "marks_obtained" DECIMAL(6,2) NOT NULL,
    "grade" VARCHAR(5),
    "remarks" TEXT,
    "entered_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."groups" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "type" "GroupType" NOT NULL,
    "created_by" UUID NOT NULL,
    "class_id" UUID,
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."messages" (
    "id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "content" TEXT,
    "type" "MessageType" NOT NULL,
    "file_url" TEXT,
    "reply_to_id" UUID,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."files" (
    "id" UUID NOT NULL,
    "uploader_id" UUID NOT NULL,
    "group_id" UUID,
    "s3_key" TEXT NOT NULL,
    "file_name" VARCHAR(500) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."notifications" (
    "id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "body" TEXT,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_schema_name_key" ON "tenants"("schema_name");

-- CreateIndex
CREATE INDEX "subscriptions_tenant_id_idx" ON "subscriptions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "tenant"."users"("email");

-- CreateIndex
CREATE INDEX "classes_class_teacher_id_idx" ON "tenant"."classes"("class_teacher_id");

-- CreateIndex
CREATE INDEX "student_profiles_class_id_idx" ON "tenant"."student_profiles"("class_id");

-- CreateIndex
CREATE INDEX "student_profiles_guardian_id_idx" ON "tenant"."student_profiles"("guardian_id");

-- CreateIndex
CREATE INDEX "subjects_class_id_idx" ON "tenant"."subjects"("class_id");

-- CreateIndex
CREATE INDEX "subjects_teacher_id_idx" ON "tenant"."subjects"("teacher_id");

-- CreateIndex
CREATE INDEX "timetable_slots_class_id_day_of_week_idx" ON "tenant"."timetable_slots"("class_id", "day_of_week");

-- CreateIndex
CREATE INDEX "timetable_slots_subject_id_idx" ON "tenant"."timetable_slots"("subject_id");

-- CreateIndex
CREATE INDEX "attendance_sessions_class_id_date_idx" ON "tenant"."attendance_sessions"("class_id", "date");

-- CreateIndex
CREATE INDEX "attendance_sessions_subject_id_idx" ON "tenant"."attendance_sessions"("subject_id");

-- CreateIndex
CREATE INDEX "attendance_sessions_teacher_id_idx" ON "tenant"."attendance_sessions"("teacher_id");

-- CreateIndex
CREATE INDEX "attendance_records_student_id_idx" ON "tenant"."attendance_records"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_session_id_student_id_key" ON "tenant"."attendance_records"("session_id", "student_id");

-- CreateIndex
CREATE INDEX "exams_class_id_idx" ON "tenant"."exams"("class_id");

-- CreateIndex
CREATE INDEX "results_student_id_idx" ON "tenant"."results"("student_id");

-- CreateIndex
CREATE INDEX "results_subject_id_idx" ON "tenant"."results"("subject_id");

-- CreateIndex
CREATE INDEX "results_entered_by_idx" ON "tenant"."results"("entered_by");

-- CreateIndex
CREATE UNIQUE INDEX "results_exam_id_student_id_subject_id_key" ON "tenant"."results"("exam_id", "student_id", "subject_id");

-- CreateIndex
CREATE INDEX "groups_created_by_idx" ON "tenant"."groups"("created_by");

-- CreateIndex
CREATE INDEX "groups_class_id_idx" ON "tenant"."groups"("class_id");

-- CreateIndex
CREATE INDEX "messages_group_id_created_at_idx" ON "tenant"."messages"("group_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "tenant"."messages"("sender_id");

-- CreateIndex
CREATE INDEX "messages_reply_to_id_idx" ON "tenant"."messages"("reply_to_id");

-- CreateIndex
CREATE INDEX "files_uploader_id_idx" ON "tenant"."files"("uploader_id");

-- CreateIndex
CREATE INDEX "files_group_id_idx" ON "tenant"."files"("group_id");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_is_read_idx" ON "tenant"."notifications"("recipient_id", "is_read");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."classes" ADD CONSTRAINT "classes_class_teacher_id_fkey" FOREIGN KEY ("class_teacher_id") REFERENCES "tenant"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."student_profiles" ADD CONSTRAINT "student_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tenant"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."student_profiles" ADD CONSTRAINT "student_profiles_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "tenant"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."student_profiles" ADD CONSTRAINT "student_profiles_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "tenant"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."teacher_profiles" ADD CONSTRAINT "teacher_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tenant"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."subjects" ADD CONSTRAINT "subjects_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "tenant"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."subjects" ADD CONSTRAINT "subjects_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "tenant"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."timetable_slots" ADD CONSTRAINT "timetable_slots_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "tenant"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."timetable_slots" ADD CONSTRAINT "timetable_slots_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "tenant"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."attendance_sessions" ADD CONSTRAINT "attendance_sessions_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "tenant"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."attendance_sessions" ADD CONSTRAINT "attendance_sessions_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "tenant"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."attendance_sessions" ADD CONSTRAINT "attendance_sessions_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "tenant"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."attendance_records" ADD CONSTRAINT "attendance_records_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "tenant"."attendance_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."attendance_records" ADD CONSTRAINT "attendance_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "tenant"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."exams" ADD CONSTRAINT "exams_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "tenant"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."results" ADD CONSTRAINT "results_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "tenant"."exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."results" ADD CONSTRAINT "results_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "tenant"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."results" ADD CONSTRAINT "results_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "tenant"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."results" ADD CONSTRAINT "results_entered_by_fkey" FOREIGN KEY ("entered_by") REFERENCES "tenant"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."groups" ADD CONSTRAINT "groups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "tenant"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."groups" ADD CONSTRAINT "groups_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "tenant"."classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."messages" ADD CONSTRAINT "messages_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "tenant"."groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "tenant"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."messages" ADD CONSTRAINT "messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "tenant"."messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."files" ADD CONSTRAINT "files_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "tenant"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."files" ADD CONSTRAINT "files_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "tenant"."groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "tenant"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
