import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../data/models/dashboard_model.dart';
import '../../../../core/constants/app_theme.dart';
import '../../admin/school_setup/setup_dashboard_screen.dart';
import '../../../../core/providers/providers.dart';
import '../../admin/user_management/user_list_screen.dart';
import '../../admin/import/excel_import_screen.dart';
import '../../admin/analytics/ai_insights_screen.dart';
import '../../admin/fees/fee_management_screen.dart';

class AdminDashboard extends ConsumerStatefulWidget {
  const AdminDashboard({super.key});

  @override
  ConsumerState<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends ConsumerState<AdminDashboard> {
  late Future<AdminDashboardData> _dashboardFuture;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    _dashboardFuture = ref.read(dashboardServiceProvider).getAdminDashboard();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<AdminDashboardData>(
      future: _dashboardFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        }
        final data = snapshot.data!;
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
                  'Overview',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.5,
                  children: [
                    _buildStatCard(
                      'Students',
                      data.totalStudents.toString(),
                      Icons.people_outline,
                      AppColors.primary,
                    ),
                    _buildStatCard(
                      'Teachers',
                      data.totalTeachers.toString(),
                      Icons.school,
                      AppColors.success,
                    ),
                    _buildStatCard(
                      'Classes',
                      data.totalClasses.toString(),
                      Icons.class_outlined,
                      AppColors.warning,
                    ),
                    _buildStatCard(
                      'Fees Collected',
                      '₹${data.collectedFees}',
                      Icons.account_balance_wallet_outlined,
                      AppColors.accent,
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                const Text(
                  'Quick Actions',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                _buildQuickAction(
                  'User Management',
                  'Manage students, teachers & staff',
                  Icons.person_add_outlined,
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const UserListScreen()),
                    );
                  },
                ),
                _buildQuickAction(
                  'School Setup',
                  'Classes, subjects, and timetable',
                  Icons.settings_outlined,
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const SetupDashboardScreen()),
                    );
                  },
                ),
                _buildQuickAction(
                  'Attendance Reports',
                  'View daily and monthly reports',
                  Icons.bar_chart_outlined,
                  () {},
                ),
                _buildQuickAction(
                  'Fee Management',
                  'Invoices and payments',
                  Icons.payment_outlined,
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const FeeManagementScreen()),
                    );
                  },
                ),
                _buildQuickAction(
                  'Bulk Import',
                  'Import users via CSV data',
                  Icons.upload_file_outlined,
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const ExcelImportScreen()),
                    );
                  },
                ),
                _buildQuickAction(
                  'AI Insights',
                  'AI powered student analytics',
                  Icons.auto_awesome_outlined,
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const AiInsightsScreen()),
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
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
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
      ),
    );
  }

  Widget _buildQuickAction(String title, String subtitle, IconData icon, VoidCallback onTap) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: AppColors.primary),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
