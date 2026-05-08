import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../data/models/dashboard_model.dart';
import '../../../../core/constants/app_theme.dart';
import '../../../../core/providers/providers.dart';
import '../../attendance/student_attendance_screen.dart';
import '../../homework/student_homework_screen.dart';
import '../../marks/student_results_screen.dart';
import '../../timetable/student_timetable_screen.dart';
import '../../fees/fee_list_screen.dart';

class StudentDashboard extends ConsumerStatefulWidget {
  const StudentDashboard({super.key});

  @override
  ConsumerState<StudentDashboard> createState() => _StudentDashboardState();
}

class _StudentDashboardState extends ConsumerState<StudentDashboard> {
  late Future<StudentDashboardData> _dashboardFuture;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    final studentId = ref.read(authProvider).user!.id;
    _dashboardFuture = ref.read(dashboardServiceProvider).getStudentDashboard(studentId);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<StudentDashboardData>(
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
                _buildProfileHeader(),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: _buildSummaryCard(
                        'Attendance',
                        data != null ? '${data.attendancePercentage}%' : '0%',
                        Icons.calendar_today_outlined,
                        AppColors.primary,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildSummaryCard(
                        'Homework',
                        data != null ? data.pendingHomework.toString() : '0',
                        Icons.assignment_outlined,
                        AppColors.warning,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                const Text(
                  'My Learning',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                _buildMenuTile('My Attendance', Icons.history, () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const StudentAttendanceScreen()),
                  );
                }),
                _buildMenuTile('Homework', Icons.assignment, () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const StudentHomeworkScreen()),
                    );
                  }),
                _buildMenuTile('Exam Results', Icons.grade, () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const StudentResultsScreen()),
                    );
                  }),
                _buildMenuTile('Timetable', Icons.schedule, () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const StudentTimetableScreen()),
                    );
                  }),
                _buildMenuTile('Fees', Icons.payment, () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const FeeListScreen()),
                    );
                  }),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildProfileHeader() {
    final user = ref.watch(authProvider).user;
    return Row(
      children: [
        CircleAvatar(
          radius: 30,
          backgroundColor: AppColors.primary.withValues(alpha: 0.1),
          child: const Icon(Icons.person, size: 30, color: AppColors.primary),
        ),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              user?.name ?? 'Student',
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              'Roll No: ${user?.studentProfile?.rollNumber ?? 'N/A'}',
              style: const TextStyle(
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSummaryCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuTile(String title, IconData icon, VoidCallback onTap) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, color: AppColors.primary),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}

