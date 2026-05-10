import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/providers.dart';
import '../../../../data/models/school_model.dart';
import '../../../widgets/ai_result_card.dart';

class AiFlashcardsScreen extends ConsumerStatefulWidget {
  const AiFlashcardsScreen({super.key});

  @override
  ConsumerState<AiFlashcardsScreen> createState() => _AiFlashcardsScreenState();
}

class _AiFlashcardsScreenState extends ConsumerState<AiFlashcardsScreen> {
  final _formKey = GlobalKey<FormState>();
  
  Subject? _selectedSubject;
  List<Subject> _subjects = [];
  
  final _chapterController = TextEditingController();
  final _countController = TextEditingController(text: '10');
  
  bool _isLoading = false;
  Map<String, dynamic>? _result;

  @override
  void initState() {
    super.initState();
    _fetchSubjects();
  }

  Future<void> _fetchSubjects() async {
    try {
      final subjects = await ref.read(schoolSetupServiceProvider).getSubjects();
      setState(() => _subjects = subjects);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load subjects: $e')));
    }
  }

  Future<void> _generate() async {
    if (!_formKey.currentState!.validate() || _selectedSubject == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all required fields.')));
      return;
    }

    setState(() {
      _isLoading = true;
      _result = null;
    });

    try {
      final result = await ref.read(aiServiceProvider).generateFlashcards(
        subjectId: _selectedSubject!.id,
        chapter: _chapterController.text,
        count: int.tryParse(_countController.text) ?? 10,
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
      appBar: AppBar(title: const Text('AI Flashcard Generator')),
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
                    DropdownButtonFormField<Subject>(
                      initialValue: _selectedSubject,
                      decoration: const InputDecoration(labelText: 'Select Subject *'),
                      items: _subjects.map((s) => DropdownMenuItem(value: s, child: Text(s.name))).toList(),
                      onChanged: (val) => setState(() => _selectedSubject = val),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _chapterController,
                      decoration: const InputDecoration(labelText: 'Chapter Name *'),
                      validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _countController,
                      decoration: const InputDecoration(labelText: 'Number of Flashcards'),
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: _isLoading ? null : _generate,
                      icon: _isLoading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.style),
                      label: Text(_isLoading ? 'Generating (up to 90s)...' : 'Generate Flashcards'),
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
                        Text('AI is creating your flashcards...'),
                      ],
                    ))
                  : _result != null
                      ? AiResultCard(
                          title: 'Generated Flashcards',
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