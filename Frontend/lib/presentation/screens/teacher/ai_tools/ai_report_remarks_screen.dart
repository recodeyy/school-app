import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/providers.dart';
import '../../../../data/models/user_model.dart';
import '../../../widgets/ai_result_card.dart';

class AiReportRemarksScreen extends ConsumerStatefulWidget {
  const AiReportRemarksScreen({super.key});

  @override
  ConsumerState<AiReportRemarksScreen> createState() => _AiReportRemarksScreenState();
}

class _AiReportRemarksScreenState extends ConsumerState<AiReportRemarksScreen> {
  final _formKey = GlobalKey<FormState>();
  
  User? _selectedStudent;
  List<User> _students = [];
  
  bool _isLoading = false;
  Map<String, dynamic>? _result;

  @override
  void initState() {
    super.initState();
    _fetchStudents();
  }

  Future<void> _fetchStudents() async {
    try {
      final students = await ref.read(userServiceProvider).getUsers(role: 'STUDENT');
      setState(() => _students = students);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load students: $e')));
    }
  }

  Future<void> _generate() async {
    if (!_formKey.currentState!.validate() || _selectedStudent == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a student.')));
      return;
    }

    setState(() {
      _isLoading = true;
      _result = null;
    });

    try {
      final result = await ref.read(aiServiceProvider).generateReportCardRemarks(
        studentId: _selectedStudent!.id,
      );
      
      setState(() => _result = result);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI Report Card Remarks')),
      body: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 1,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    DropdownButtonFormField<User>(
                      initialValue: _selectedStudent,
                      decoration: const InputDecoration(labelText: 'Select Student *'),
                      items: _students.map((s) => DropdownMenuItem(value: s, child: Text(s.name))).toList(),
                      onChanged: (val) => setState(() => _selectedStudent = val),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: _isLoading ? null : _generate,
                      icon: _isLoading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.assignment_ind),
                      label: Text(_isLoading ? 'Generating (up to 90s)...' : 'Generate Remarks'),
                      style: ElevatedButton.styleFrom(padding: const EdgeInsets.all(16)),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const VerticalDivider(width: 1),
          Expanded(
            flex: 2,
            child: Container(
              color: Colors.grey[50],
              padding: const EdgeInsets.all(16),
              child: _isLoading
                  ? const Center(child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(),
                        SizedBox(height: 16),
                        Text('AI is analyzing student data to write remarks...'),
                      ],
                    ))
                  : _result != null
                      ? AiResultCard(
                          title: 'Generated Remarks',
                          content: _result,
                        )
                      : const Center(child: Text('Select a student and click Generate.')),
            ),
          ),
        ],
      ),
    );
  }
}