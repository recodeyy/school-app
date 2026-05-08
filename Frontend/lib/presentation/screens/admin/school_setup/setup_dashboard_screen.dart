import 'package:flutter/material.dart';
import '../../../../core/constants/app_theme.dart';
import 'manage_classes_screen.dart';
import 'manage_subjects_screen.dart';

class SetupDashboardScreen extends StatelessWidget {
  const SetupDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('School Configuration')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildInfoCard(context),
            const SizedBox(height: 32),
            Text('Academic Setup', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 16),
            _buildSetupGrid(context),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.secondary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.secondary.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline, color: AppColors.secondary, size: 32),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              'Configure your school infrastructure here. These settings affect the entire academic workflow.',
              style: TextStyle(color: AppColors.secondary.withValues(alpha: 0.8), fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSetupGrid(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 0.9,
      children: [
        _buildSetupCard(context, 'Classes', 'Standard, Division', Icons.class_outlined, AppColors.primary, () {
          Navigator.push(context, MaterialPageRoute(builder: (context) => const ManageClassesScreen()));
        }),
        _buildSetupCard(context, 'Subjects', 'Mapping, Teachers', Icons.auto_stories_outlined, AppColors.secondary, () {
          Navigator.push(context, MaterialPageRoute(builder: (context) => const ManageSubjectsScreen()));
        }),
        _buildSetupCard(context, 'Timetable', 'Periods, Slots', Icons.schedule_outlined, AppColors.warning, () {}),
        _buildSetupCard(context, 'Holidays', 'Vacations, Events', Icons.event_note_outlined, AppColors.error, () {}),
      ],
    );
  }

  Widget _buildSetupCard(BuildContext context, String title, String desc, IconData icon, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.grey.withValues(alpha: 0.1)),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: color, size: 24),
            ),
            const Spacer(),
            Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
            const SizedBox(height: 4),
            Text(desc, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }
}
