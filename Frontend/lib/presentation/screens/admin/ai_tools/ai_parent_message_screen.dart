import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/providers.dart';
import '../../../../data/models/user_model.dart';
import '../../../widgets/ai_result_card.dart';

class AiParentMessageScreen extends ConsumerStatefulWidget {
  const AiParentMessageScreen({super.key});

  @override
  ConsumerState<AiParentMessageScreen> createState() => _AiParentMessageScreenState();
}

class _AiParentMessageScreenState extends ConsumerState<AiParentMessageScreen> {
  final _formKey = GlobalKey<FormState>();
  
  User? _selectedStudent;
  List<User> _students = [];
  
  final _detailsController = TextEditingController();
  
  String _issue = 'general';
  String _tone = 'formal';
  String _language = 'en';
  
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
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a student and provide details.')));
      return;
    }

    setState(() {
      _isLoading = true;
      _result = null;
    });

    try {
      final result = await ref.read(aiServiceProvider).generateParentMessage(
        studentId: _selectedStudent!.id,
        issue: _issue,
        details: _detailsController.text,
        language: _language,
        tone: _tone,
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
      appBar: AppBar(title: const Text('AI Parent Message Generator')),
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
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      initialValue: _issue,
                      decoration: const InputDecoration(labelText: 'Issue Category'),
                      items: ['attendance', 'behavior', 'fees', 'academic', 'health', 'general']
                          .map((i) => DropdownMenuItem(value: i, child: Text(i.toUpperCase())))
                          .toList(),
                      onChanged: (val) => setState(() => _issue = val!),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _detailsController,
                      decoration: const InputDecoration(
                        labelText: 'Specific Details *',
                        alignLabelWithHint: true,
                      ),
                      maxLines: 4,
                      validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      initialValue: _tone,
                      decoration: const InputDecoration(labelText: 'Tone'),
                      items: ['formal', 'friendly', 'concerned']
                          .map((t) => DropdownMenuItem(value: t, child: Text(t.toUpperCase())))
                          .toList(),
                      onChanged: (val) => setState(() => _tone = val!),
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      initialValue: _language,
                      decoration: const InputDecoration(labelText: 'Language'),
                      items: [
                        const DropdownMenuItem(value: 'en', child: Text('English')),
                        const DropdownMenuItem(value: 'hi', child: Text('Hindi')),
                        const DropdownMenuItem(value: 'mr', child: Text('Marathi')),
                      ],
                      onChanged: (val) => setState(() => _language = val!),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: _isLoading ? null : _generate,
                      icon: _isLoading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.message),
                      label: Text(_isLoading ? 'Generating (up to 90s)...' : 'Generate Message'),
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
                        Text('AI is writing your message...'),
                      ],
                    ))
                  : _result != null
                      ? AiResultCard(
                          title: 'Parent Message Draft',
                          content: _result,
                        )
                      : const Center(child: Text('Fill out the form and click Generate.')),
            ),
          ),
        ],
      ),
    );
  }
}