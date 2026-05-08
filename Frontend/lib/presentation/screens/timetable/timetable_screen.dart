import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_theme.dart';
import '../../../core/providers/providers.dart';
import '../../../data/models/timetable_model.dart';

class TimetableScreen extends ConsumerStatefulWidget {
  const TimetableScreen({super.key});

  @override
  ConsumerState<TimetableScreen> createState() => _TimetableScreenState();
}

class _TimetableScreenState extends ConsumerState<TimetableScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<String> _days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  List<TimetableEntry> _entries = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _days.length, vsync: this);
    _fetchTimetable();
  }

  Future<void> _fetchTimetable() async {
    setState(() => _isLoading = true);
    try {
      final user = ref.read(authProvider).user!;
      List<TimetableEntry> entries = [];

      if (user.role == 'STUDENT') {
        final classId = user.studentProfile?.classId;
        if (classId != null) {
          entries = await ref.read(timetableServiceProvider).getClassTimetable(classId);
        }
      } else if (user.role == 'TEACHER') {
        entries = await ref.read(timetableServiceProvider).getTeacherTimetable(user.id);
      }
      
      setState(() {
        _entries = entries;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Weekly Timetable'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: _days.map((day) => Tab(text: day.substring(0, 3))).toList(),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: _days.map((day) => _buildDayList(day)).toList(),
            ),
    );
  }

  Widget _buildDayList(String day) {
    final dayEntries = _entries.where((e) => e.dayOfWeek == day).toList();
    dayEntries.sort((a, b) => (a.startTime ?? '').compareTo(b.startTime ?? ''));

    if (dayEntries.isEmpty) {
      return const Center(child: Text('No periods scheduled'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: dayEntries.length,
      itemBuilder: (context, index) {
        final entry = dayEntries[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Column(
                  children: [
                    Text(entry.startTime ?? '--:--', style: const TextStyle(fontWeight: FontWeight.bold)),
                    const Text('to', style: TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                    Text(entry.endTime ?? '--:--', style: const TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(width: 16),
                const VerticalDivider(),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(entry.subjectName ?? 'Subject', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      Text(entry.teacherName ?? 'Teacher', style: const TextStyle(color: AppColors.textSecondary)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(entry.periodName ?? 'P${index + 1}', style: const TextStyle(color: AppColors.primary, fontSize: 12)),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
