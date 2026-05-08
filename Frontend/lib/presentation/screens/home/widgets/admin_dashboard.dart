import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/dashboard_provider.dart';
import '../../../../core/constants/app_theme.dart';
import '../../admin/school_setup/setup_dashboard_screen.dart';
import '../../../../core/providers/providers.dart';
import '../../admin/user_management/user_list_screen.dart';
import '../../admin/import/excel_import_screen.dart';
import '../../admin/analytics/ai_insights_screen.dart';
import '../../admin/fees/fee_management_screen.dart';

class AdminDashboard extends ConsumerWidget {
  const AdminDashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardAsync = ref.watch(adminDashboardProvider);

    return dashboardAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, stack) => Center(child: Text('Error: $err')),
      data: (data) => RefreshIndicator(
        onRefresh: () => ref.read(adminDashboardProvider.notifier).refresh(),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(context, ref),
              const SizedBox(height: 32),
              _buildStatGrid(data),
              const SizedBox(height: 40),
              Text('Quick Actions', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 20),
              _buildActionGrid(context),
              const SizedBox(height: 40),
              _buildAiHighlightCard(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Welcome back,', style: Theme.of(context).textTheme.bodyLarge),
            Text(user?.name ?? 'Administrator', style: Theme.of(context).textTheme.headlineLarge),
          ],
        ),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)],
          ),
          child: const Icon(Icons.notifications_none_outlined, color: AppColors.textPrimary),
        ),
      ],
    );
  }

  Widget _buildStatGrid(dynamic data) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.4,
      children: [
        _buildModernStatCard('Students', data.totalStudents.toString(), Icons.group_outlined, AppColors.primary),
        _buildModernStatCard('Teachers', data.totalTeachers.toString(), Icons.school_outlined, AppColors.secondary),
        _buildModernStatCard('Classes', data.totalClasses.toString(), Icons.class_outlined, AppColors.warning),
        _buildModernStatCard('Revenue', '₹${data.collectedFees}', Icons.account_balance_wallet_outlined, AppColors.success),
      ],
    );
  }

  Widget _buildModernStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: color.withValues(alpha: 0.1), width: 1.5),
        boxShadow: [BoxShadow(color: color.withValues(alpha: 0.03), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: color, size: 20),
          ),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
          Text(title, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildActionGrid(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.1,
      children: [
        _buildActionCard(context, 'Users', 'Add & Manage', Icons.person_add_outlined, () => _nav(context, const UserListScreen())),
        _buildActionCard(context, 'Setup', 'School Config', Icons.settings_outlined, () => _nav(context, const SetupDashboardScreen())),
        _buildActionCard(context, 'Fees', 'Invoices', Icons.payment_outlined, () => _nav(context, const FeeManagementScreen())),
        _buildActionCard(context, 'Import', 'CSV Bulk', Icons.upload_file_outlined, () => _nav(context, const ExcelImportScreen())),
      ],
    );
  }

  Widget _buildActionCard(BuildContext context, String title, String sub, IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.grey.withValues(alpha: 0.1)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: AppColors.primary, size: 32),
            const SizedBox(height: 16),
            Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
            Text(sub, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }

  Widget _buildAiHighlightCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('AI Insights Ready', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('Get automated reports for student performance and risks.', style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 14)),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () => _nav(context, const AiInsightsScreen()),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: AppColors.primary),
                  child: const Text('View Insights'),
                ),
              ],
            ),
          ),
          const Icon(Icons.auto_awesome, color: Colors.white, size: 80),
        ],
      ),
    );
  }

  void _nav(BuildContext context, Widget screen) {
    Navigator.push(context, MaterialPageRoute(builder: (context) => screen));
  }
}
