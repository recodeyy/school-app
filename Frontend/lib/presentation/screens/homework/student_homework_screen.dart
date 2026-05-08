import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../data/models/homework_model.dart';
import '../../../../core/constants/app_theme.dart';
import '../../../../core/providers/providers.dart';

class StudentHomeworkScreen extends ConsumerStatefulWidget {
  const StudentHomeworkScreen({super.key});

  @override
  ConsumerState<StudentHomeworkScreen> createState() => _StudentHomeworkScreenState();
}

class _StudentHomeworkScreenState extends ConsumerState<StudentHomeworkScreen> {
  late Future<List<Homework>> _homeworkFuture;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    final studentId = ref.read(authProvider).user!.id;
    _homeworkFuture = ref.read(homeworkServiceProvider).getStudentHomework(studentId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Homework'),
      ),
      body: FutureBuilder<List<Homework>>(
        future: _homeworkFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          final homeworkList = snapshot.data!;
          if (homeworkList.isEmpty) {
            return const Center(child: Text('No homework assigned'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: homeworkList.length,
            itemBuilder: (context, index) {
              final homework = homeworkList[index];
              final isPastDue = homework.dueDate.isBefore(DateTime.now());

              return Card(
                margin: const EdgeInsets.only(bottom: 16),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              homework.title,
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: isPastDue ? AppColors.error.withValues(alpha: 0.1) : AppColors.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              isPastDue ? 'Past Due' : 'Active',
                              style: TextStyle(
                                color: isPastDue ? AppColors.error : AppColors.primary,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        homework.subjectName ?? 'Subject',
                        style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        homework.description ?? 'No description provided',
                        style: const TextStyle(color: AppColors.textSecondary),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.calendar_today, size: 16, color: AppColors.textSecondary),
                              const SizedBox(width: 4),
                              Text(
                                'Due: ${DateFormat('MMM d, yyyy').format(homework.dueDate)}',
                                style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                              ),
                            ],
                          ),
                          ElevatedButton(
                            onPressed: () {
                              // Navigate to homework details/submission
                            },
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              minimumSize: Size.zero,
                            ),
                            child: const Text('View Details'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
