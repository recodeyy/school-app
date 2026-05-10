import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/dashboard_provider.dart';
import '../../../../core/constants/app_theme.dart';
import '../../../../core/providers/providers.dart';
import '../../attendance/mark_attendance_screen.dart';
import '../../homework/teacher_homework_list_screen.dart';
import '../../marks/upload_marks_screen.dart';
import '../../timetable/timetable_screen.dart';
import '../../teacher/ai_tools/ai_lesson_plan_screen.dart';
import '../../teacher/ai_tools/ai_quiz_screen.dart';
import '../../teacher/ai_tools/ai_homework_screen.dart';
import '../../teacher/ai_tools/ai_question_paper_screen.dart';
import '../../teacher/ai_tools/ai_report_remarks_screen.dart';

class TeacherDashboard extends ConsumerWidget {
  const TeacherDashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final teacherId = ref.watch(authProvider).user!.id;
    final dashboardAsync = ref.watch(teacherDashboardProvider(teacherId));

    return dashboardAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, stack) => Center(child: Text('Error: $err')),
      data: (data) => RefreshIndicator(
        onRefresh: () => ref.read(teacherDashboardProvider(teacherId).notifier).refresh(teacherId),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildTeacherHeader(context, ref),
              const SizedBox(height: 32),
              _buildTeacherStats(data),
              const SizedBox(height: 40),
              Text('Academic Tasks', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 20),
              _buildTaskGrid(context),
              const SizedBox(height: 40),
              Text('AI Assistant', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 20),
              _buildAiToolsGrid(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTeacherHeader(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Good Morning,', style: Theme.of(context).textTheme.bodyLarge),
        Text(user?.name ?? 'Teacher', style: Theme.of(context).textTheme.headlineLarge),
      ],
    );
  }

  Widget _buildTeacherStats(dynamic data) {
    return Row(
      children: [
        Expanded(
          child: _buildStatTile(
            'Assigned Classes',
            '${data.totalClasses}',
            Icons.class_rounded,
            AppColors.primary,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildStatTile(
            'Total Students',
            '${data.totalStudents}',
            Icons.people_alt_rounded,
            AppColors.secondary,
          ),
        ),
      ],
    );
  }

  Widget _buildStatTile(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: color.withValues(alpha: 0.1)),
        boxShadow: [BoxShadow(color: color.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 16),
          Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
          Text(title, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        ],
      ),
    );
  }

  Widget _buildTaskGrid(BuildContext context) {
    return Column(
      children: [
        _buildActionTile(context, 'Mark Attendance', 'Record daily student presence', Icons.fact_check_rounded, AppColors.primary, () {
          Navigator.push(context, MaterialPageRoute(builder: (context) => const MarkAttendanceScreen()));
        }),
        _buildActionTile(context, 'Manage Homework', 'Assign and grade work', Icons.auto_stories_rounded, AppColors.secondary, () {
          Navigator.push(context, MaterialPageRoute(builder: (context) => const TeacherHomeworkListScreen()));
        }),
        _buildActionTile(context, 'Enter Marks', 'Record exam and test results', Icons.grade_rounded, AppColors.warning, () {
          Navigator.push(context, MaterialPageRoute(builder: (context) => const UploadMarksScreen()));
        }),
        _buildActionTile(context, 'My Timetable', 'View your weekly schedule', Icons.event_note_rounded, AppColors.accent, () {
          Navigator.push(context, MaterialPageRoute(builder: (context) => const TimetableScreen()));
        }),
      ],
    );
  }

  Widget _buildActionTile(BuildContext context, String title, String sub, IconData icon, Color color, VoidCallback onTap) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.grey.withValues(alpha: 0.1)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(14)),
                child: Icon(icon, color: color, size: 24),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    Text(sub, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.textMuted),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAiToolsGrid(BuildContext context) {
    return Column(
      children: [
        _buildActionTile(context, 'AI Lesson Planner', 'Generate detailed lesson plans in seconds', Icons.auto_awesome, Colors.purple, () {
          Navigator.push(context, MaterialPageRoute(builder: (context) => const AiLessonPlanScreen()));
        }),
        _buildActionTile(context, 'AI Quiz Generator', 'Create quizzes tailored to your class', Icons.quiz, Colors.deepOrange, () {
          Navigator.push(context, MaterialPageRoute(builder: (context) => const AiQuizScreen()));
        }),
        _buildActionTile(context, 'AI Homework Assistant', 'Design creative homework assignments', Icons.auto_stories, Colors.teal, () {
          Navigator.push(context, MaterialPageRoute(builder: (context) => const AiHomeworkScreen()));
        }),
        _buildActionTile(context, 'AI Question Paper', 'Generate full exam papers instantly', Icons.description, Colors.indigo, () {
          Navigator.push(context, MaterialPageRoute(builder: (context) => const AiQuestionPaperScreen()));
        }),
        _buildActionTile(context, 'AI Report Remarks', 'Write personalized student feedback', Icons.assignment_ind, Colors.blueGrey, () {
          Navigator.push(context, MaterialPageRoute(builder: (context) => const AiReportRemarksScreen()));
        }),
      ],
    );
  }
}
