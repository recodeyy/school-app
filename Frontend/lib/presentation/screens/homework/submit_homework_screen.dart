import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../data/models/homework_model.dart';
import '../../../../core/constants/app_theme.dart';
import '../../../../core/providers/providers.dart';

class SubmitHomeworkScreen extends ConsumerStatefulWidget {
  final Homework homework;
  const SubmitHomeworkScreen({super.key, required this.homework});

  @override
  ConsumerState<SubmitHomeworkScreen> createState() => _SubmitHomeworkScreenState();
}

class _SubmitHomeworkScreenState extends ConsumerState<SubmitHomeworkScreen> {
  final _contentController = TextEditingController();
  bool _isSubmitting = false;
  HomeworkSubmission? _existingSubmission;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkExistingSubmission();
  }

  @override
  void dispose() {
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _checkExistingSubmission() async {
    try {
      final studentId = ref.read(authProvider).user!.id;
      final submissions = await ref.read(homeworkServiceProvider).getSubmissions(widget.homework.id);
      
      final mySubmission = submissions.where((s) => s.studentId == studentId).firstOrNull;
      if (mySubmission != null) {
        setState(() {
          _existingSubmission = mySubmission;
          _contentController.text = mySubmission.content ?? '';
        });
      }
    } catch (e) {
      // Ignore errors fetching submission, maybe none exists.
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _submit() async {
    if (_contentController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your answer')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final submission = await ref.read(homeworkServiceProvider).submitHomework(
        homeworkId: widget.homework.id,
        content: _contentController.text.trim(),
      );

      setState(() {
        _existingSubmission = submission;
        _isSubmitting = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Homework submitted successfully!'), backgroundColor: AppColors.success),
        );
      }
    } catch (e) {
      setState(() => _isSubmitting = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isPastDue = widget.homework.dueDate.isBefore(DateTime.now());

    return Scaffold(
      appBar: AppBar(
        title: const Text('Homework Details'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildDetailsCard(),
                  const SizedBox(height: 24),
                  if (_existingSubmission != null)
                    _buildSubmissionStatusCard()
                  else
                    _buildSubmissionForm(isPastDue),
                ],
              ),
            ),
    );
  }

  Widget _buildDetailsCard() {
    final isPastDue = widget.homework.dueDate.isBefore(DateTime.now());
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    widget.homework.title,
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
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
            const SizedBox(height: 12),
            Text(
              'Subject: ${widget.homework.subjectName ?? 'N/A'}',
              style: const TextStyle(fontWeight: FontWeight.w500, color: AppColors.primary),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.calendar_today, size: 16, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Text(
                  'Due: ${DateFormat('MMM d, yyyy h:mm a').format(widget.homework.dueDate)}',
                  style: const TextStyle(color: AppColors.textSecondary),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Instructions:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(widget.homework.description ?? 'No instructions provided.'),
          ],
        ),
      ),
    );
  }

  Widget _buildSubmissionForm(bool isPastDue) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Your Answer',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _contentController,
              maxLines: 6,
              decoration: const InputDecoration(
                hintText: 'Type your answer here...',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submit,
              child: _isSubmitting
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Submit Homework'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubmissionStatusCard() {
    final sub = _existingSubmission!;
    Color statusColor = AppColors.success;
    if (sub.status == 'LATE') statusColor = AppColors.warning;
    if (sub.status == 'GRADED') statusColor = AppColors.primary;

    return Card(
      color: statusColor.withValues(alpha: 0.05),
      shape: RoundedRectangleBorder(
        side: BorderSide(color: statusColor.withValues(alpha: 0.2)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Submission Status', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                Chip(
                  label: Text(sub.status, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  backgroundColor: statusColor,
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Your Answer:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Text(sub.content ?? 'No content'),
            ),
            if (sub.status == 'GRADED') ...[
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Text('Grade: ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  Text(sub.grade ?? 'N/A', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
              if (sub.feedback != null && sub.feedback!.isNotEmpty) ...[
                const SizedBox(height: 8),
                const Text('Teacher Feedback:', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(sub.feedback!),
              ],
            ],
          ],
        ),
      ),
    );
  }
}
