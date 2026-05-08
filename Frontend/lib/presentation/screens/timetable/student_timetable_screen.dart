import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../data/models/timetable_model.dart';
import '../../../../core/constants/app_theme.dart';
import '../../../../core/providers/providers.dart';

class StudentTimetableScreen extends ConsumerStatefulWidget {
  const StudentTimetableScreen({super.key});

  @override
  ConsumerState<StudentTimetableScreen> createState() => _StudentTimetableScreenState();
}

class _StudentTimetableScreenState extends ConsumerState<StudentTimetableScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late Future<List<TimetableEntry>> _timetableFuture;
  final List<String> _days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _days.length, vsync: this);
    _loadData();
  }

  void _loadData() {
    final user = ref.read(authProvider).user;
    final classId = user?.studentProfile?.classId ?? '';
    _timetableFuture = ref.read(timetableServiceProvider).getClassTimetable(classId);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Timetable'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: _days.map((day) => Tab(text: day.substring(0, 3))).toList(),
        ),
      ),
      body: FutureBuilder<List<TimetableEntry>>(
        future: _timetableFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          final entries = snapshot.data!;

          return TabBarView(
            controller: _tabController,
            children: _days.map((day) {
              final dayEntries = entries.where((e) => e.dayOfWeek == day).toList();
              if (dayEntries.isEmpty) {
                return const Center(child: Text('No classes scheduled'));
              }

              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: dayEntries.length,
                itemBuilder: (context, index) {
                  final entry = dayEntries[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      leading: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          entry.startTime ?? '--:--',
                          style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
                        ),
                      ),
                      title: Text(entry.subjectName ?? 'Subject', style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text(entry.teacherName ?? 'Teacher'),
                      trailing: Text(entry.periodName ?? ''),
                    ),
                  );
                },
              );
            }).toList(),
          );
        },
      ),
    );
  }
}
