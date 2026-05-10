import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../data/models/homework_model.dart';
import '../../../../core/constants/app_theme.dart';
import '../../../../core/providers/providers.dart';
import 'create_homework_screen.dart';
import 'teacher_homework_submissions_screen.dart';

class TeacherHomeworkListScreen extends ConsumerStatefulWidget {
  const TeacherHomeworkListScreen({super.key});

  @override
  ConsumerState<TeacherHomeworkListScreen> createState() => _TeacherHomeworkListScreenState();
}

class _TeacherHomeworkListScreenState extends ConsumerState<TeacherHomeworkListScreen> {
  late Future<List<Homework>> _homeworkFuture;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    _homeworkFuture = ref.read(homeworkServiceProvider).getHomeworkList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Homework'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const CreateHomeworkScreen()),
          ).then((_) => setState(() => _loadData()));
        },
        child: const Icon(Icons.add),
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
            return const Center(child: Text('No homework assigned yet'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: homeworkList.length,
            itemBuilder: (context, index) {
              final homework = homeworkList[index];
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
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        homework.subjectName ?? 'Subject',
                        style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(height: 8),
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
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => TeacherHomeworkSubmissionsScreen(homework: homework),
                              ),
                            );
                          },
                          child: const Text('View Submissions & Grade'),
                        ),
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
