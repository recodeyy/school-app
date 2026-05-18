import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_theme.dart';
import '../../../../core/providers/providers.dart';
import '../../../../data/models/dashboard_model.dart';
import '../../fees/fee_list_screen.dart';
import '../../attendance/student_attendance_screen.dart';
import '../../marks/student_results_screen.dart';
import '../../notices/notice_list_screen.dart';

class ParentDashboard extends ConsumerStatefulWidget {
  const ParentDashboard({super.key});

  @override
  ConsumerState<ParentDashboard> createState() => _ParentDashboardState();
}

class _ParentDashboardState extends ConsumerState<ParentDashboard> {
  late Future<ParentDashboardData> _dashboardFuture;
  String? _selectedChildId;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    final parentId = ref.read(authProvider).user!.id;
    _dashboardFuture = ref.read(dashboardServiceProvider).getParentDashboard(parentId);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<ParentDashboardData>(
      future: _dashboardFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        }
        
        final data = snapshot.data!;
        if (data.childrenOverview.isEmpty) {
          return const Center(child: Text('No children found.'));
        }

        // Default to first child if none selected
        _selectedChildId ??= data.childrenOverview.first.childId;
        final selectedChild = data.childrenOverview.firstWhere(
          (c) => c.childId == _selectedChildId,
          orElse: () => data.childrenOverview.first,
        );

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
                const Text(
                  'My Children',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                if (data.childrenOverview.length > 1)
                  DropdownButton<String>(
                    value: _selectedChildId,
                    isExpanded: true,
                    items: data.childrenOverview.map((child) {
                      return DropdownMenuItem(
                        value: child.childId,
                        child: Text(child.name),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() {
                          _selectedChildId = val;
                        });
                      }
                    },
                  ),
                if (data.childrenOverview.length > 1)
                  const SizedBox(height: 16),
                _buildChildCard(
                  selectedChild.name, 
                  selectedChild.dashboard.className ?? 'N/A', 
                  'Roll No: ${selectedChild.dashboard.rollNumber ?? 'N/A'}'
                ),
                const SizedBox(height: 24),
                const Text(
                  'Quick Access',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                _buildQuickAction('Fees & Payments', Icons.payment, AppColors.primary, () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => FeeListScreen(studentId: selectedChild.childId)),
                  );
                }),
                _buildQuickAction('Attendance', Icons.calendar_today, AppColors.success, () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const StudentAttendanceScreen()), // Needs studentId modification if supported
                  );
                }),
                _buildQuickAction('Exam Results', Icons.grade, AppColors.warning, () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const StudentResultsScreen()), // Needs studentId modification if supported
                  );
                }),
                _buildQuickAction('Notices', Icons.notifications_none, AppColors.accent, () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const NoticeListScreen()),
                  );
                }),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildChildCard(String name, String className, String rollNo) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            const CircleAvatar(
              radius: 25,
              child: Icon(Icons.person),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(className, style: const TextStyle(color: AppColors.textSecondary)),
                  Text(rollNo, style: const TextStyle(color: AppColors.textSecondary)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickAction(String title, IconData icon, Color color, VoidCallback onTap) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, color: color),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
