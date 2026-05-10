import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../data/models/homework_model.dart';
import '../../../../core/constants/app_theme.dart';
import '../../../../core/providers/providers.dart';

class TeacherHomeworkSubmissionsScreen extends ConsumerStatefulWidget {
  final Homework homework;
  const TeacherHomeworkSubmissionsScreen({super.key, required this.homework});

  @override
  ConsumerState<TeacherHomeworkSubmissionsScreen> createState() => _TeacherHomeworkSubmissionsScreenState();
}

class _TeacherHomeworkSubmissionsScreenState extends ConsumerState<TeacherHomeworkSubmissionsScreen> {
  late Future<List<HomeworkSubmission>> _submissionsFuture;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    _submissionsFuture = ref.read(homeworkServiceProvider).getSubmissions(widget.homework.id);
  }

  void _showGradeDialog(HomeworkSubmission submission) {
    final gradeController = TextEditingController(text: submission.grade ?? '');
    final feedbackController = TextEditingController(text: submission.feedback ?? '');
    bool isSubmitting = false;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Grade Submission'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: gradeController,
                  decoration: const InputDecoration(labelText: 'Grade (e.g. A, 95/100)'),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: feedbackController,
                  decoration: const InputDecoration(labelText: 'Feedback'),
                  maxLines: 3,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: isSubmitting
                  ? null
                  : () async {
                      if (gradeController.text.trim().isEmpty) return;
                      setState(() => isSubmitting = true);
                      try {
                        await ref.read(homeworkServiceProvider).gradeHomework(
                              homeworkId: widget.homework.id,
                              studentId: submission.studentId,
                              grade: gradeController.text.trim(),
                              feedback: feedbackController.text.trim(),
                            );
                        if (context.mounted) {
                          Navigator.pop(context);
                        }
                        if (mounted) {
                          setState(() {
                            _loadData();
                          });
                        }
                      } catch (e) {
                        setState(() => isSubmitting = false);
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
                          );
                        }
                      }
                    },
              child: isSubmitting
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Save Grade'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Submissions'),
      ),
      body: FutureBuilder<List<HomeworkSubmission>>(
        future: _submissionsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          
          final submissions = snapshot.data!;
          if (submissions.isEmpty) {
            return const Center(child: Text('No submissions yet'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: submissions.length,
            itemBuilder: (context, index) {
              final sub = submissions[index];
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
                          Text(
                            'Student ID: ${sub.studentId.substring(0, 8)}...',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          Chip(
                            label: Text(sub.status, style: const TextStyle(color: Colors.white, fontSize: 12)),
                            backgroundColor: sub.status == 'GRADED' 
                                ? AppColors.success 
                                : sub.status == 'LATE' 
                                    ? AppColors.warning 
                                    : AppColors.primary,
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Submitted: ${sub.submittedAt != null ? DateFormat('MMM d, h:mm a').format(sub.submittedAt!) : 'Unknown'}',
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                      ),
                      const SizedBox(height: 12),
                      const Text('Answer:', style: TextStyle(fontWeight: FontWeight.w500)),
                      const SizedBox(height: 4),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.grey.shade200),
                        ),
                        child: Text(sub.content ?? 'No content provided'),
                      ),
                      const SizedBox(height: 16),
                      if (sub.status == 'GRADED') ...[
                        Row(
                          children: [
                            const Text('Grade: ', style: TextStyle(fontWeight: FontWeight.bold)),
                            Text(sub.grade ?? '', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        if (sub.feedback != null && sub.feedback!.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text('Feedback: ${sub.feedback}', style: const TextStyle(color: AppColors.textSecondary)),
                        ],
                        const SizedBox(height: 16),
                      ],
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton(
                          onPressed: () => _showGradeDialog(sub),
                          child: Text(sub.status == 'GRADED' ? 'Edit Grade' : 'Grade Submission'),
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
