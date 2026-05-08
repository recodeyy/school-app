import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../data/models/dashboard_model.dart';
import '../../../../core/constants/app_theme.dart';
import '../../../../core/providers/providers.dart';
import '../../attendance/mark_attendance_screen.dart';
import '../../homework/create_homework_screen.dart';
import '../../marks/upload_marks_screen.dart';
import '../../timetable/timetable_screen.dart';

class TeacherDashboard extends ConsumerStatefulWidget {
  const TeacherDashboard({super.key});

  @override
  ConsumerState<TeacherDashboard> createState() => _TeacherDashboardState();
}

class _TeacherDashboardState extends ConsumerState<TeacherDashboard> {
  late Future<TeacherDashboardData> _dashboardFuture;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    final teacherId = ref.read(authProvider).user!.id;
    _dashboardFuture = ref.read(dashboardServiceProvider).getTeacherDashboard(teacherId);
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;

    return FutureBuilder<TeacherDashboardData>(
      future: _dashboardFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        }
        
        final data = snapshot.data;
        
        return RefreshIndicator(
          onRefresh: () async {
            setState(() {
              _loadData();
            });
          },
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Welcome, ${user?.name ?? 'Teacher'}',
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Quick Stats',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                        'Classes',
                        data != null ? data.totalClasses.toString() : '0',
                        Icons.class_outlined,
                        AppColors.primary,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildStatCard(
                        'Students',
                        data != null ? data.totalStudents.toString() : '0',
                        Icons.people_outline,
                        AppColors.success,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                const Text(
                  'Tasks',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                _buildTaskItem(
                  'Mark Attendance',
                  'Mark today\'s attendance for your classes',
                  Icons.check_circle_outline,
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const MarkAttendanceScreen()),
                    );
                  },
                ),
                _buildTaskItem(
                  'Homework',
                  'Create or grade homework assignments',
                  Icons.assignment_outlined,
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const CreateHomeworkScreen()),
                    );
                  },
                ),
                _buildTaskItem(
                  'Enter Marks',
                  'Upload student marks for exams',
                  Icons.grade_outlined,
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const UploadMarksScreen()),
                    );
                  },
                ),
                _buildTaskItem(
                  'Timetable',
                  'View your teaching schedule',
                  Icons.calendar_today_outlined,
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const TimetableScreen()),
                    );
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              title,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskItem(String title, String subtitle, IconData icon, VoidCallback onTap) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, color: AppColors.primary),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }
}
