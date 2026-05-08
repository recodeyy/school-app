import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_theme.dart';
import 'manage_classes_screen.dart';
import 'manage_subjects_screen.dart';

class SetupDashboardScreen extends ConsumerWidget {
  const SetupDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('School Setup')),
      body: GridView.count(
        padding: const EdgeInsets.all(16),
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        children: [
          _buildSetupCard(
            context,
            'Classes & Sections',
            Icons.class_outlined,
            AppColors.primary,
            () => Navigator.push(context, MaterialPageRoute(builder: (context) => const ManageClassesScreen())),
          ),
          _buildSetupCard(
            context,
            'Subjects',
            Icons.book_outlined,
            AppColors.success,
            () => Navigator.push(context, MaterialPageRoute(builder: (context) => const ManageSubjectsScreen())),
          ),
          _buildSetupCard(
            context,
            'Academic Years',
            Icons.calendar_today_outlined,
            AppColors.warning,
            () {}, // Placeholder
          ),
          _buildSetupCard(
            context,
            'Holidays',
            Icons.event_available_outlined,
            AppColors.accent,
            () {}, // Placeholder
          ),
          _buildSetupCard(
            context,
            'Periods',
            Icons.timer_outlined,
            Colors.deepPurple,
            () {}, // Placeholder
          ),
        ],
      ),
    );
  }

  Widget _buildSetupCard(BuildContext context, String title, IconData icon, Color color, VoidCallback onTap) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: color),
            const SizedBox(height: 12),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }
}
