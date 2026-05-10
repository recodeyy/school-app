import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/providers.dart';
import '../../../../data/models/school_model.dart';
import '../../../widgets/ai_result_card.dart';

class AiPracticeQuizScreen extends ConsumerStatefulWidget {
  const AiPracticeQuizScreen({super.key});

  @override
  ConsumerState<AiPracticeQuizScreen> createState() => _AiPracticeQuizScreenState();
}

class _AiPracticeQuizScreenState extends ConsumerState<AiPracticeQuizScreen> {
  final _formKey = GlobalKey<FormState>();
  
  Subject? _selectedSubject;
  List<Subject> _subjects = [];
  
  final _chapterController = TextEditingController();
  final _weakTopicsController = TextEditingController();
  
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
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a subject.')));
      return;
    }

    setState(() {
      _isLoading = true;
      _result = null;
    });

    try {
      final weakTopicsList = _weakTopicsController.text.isNotEmpty 
          ? _weakTopicsController.text.split(',').map((e) => e.trim()).toList() 
          : null;

      final result = await ref.read(aiServiceProvider).generatePracticeQuiz(
        subjectId: _selectedSubject!.id,
        chapter: _chapterController.text.isNotEmpty ? _chapterController.text : null,
        weakTopics: weakTopicsList,
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
      appBar: AppBar(title: const Text('AI Practice Quiz')),
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
                      decoration: const InputDecoration(labelText: 'Chapter Name (Optional)'),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _weakTopicsController,
                      decoration: const InputDecoration(labelText: 'Weak Topics (Comma separated) (Optional)'),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: _isLoading ? null : _generate,
                      icon: _isLoading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.quiz),
                      label: Text(_isLoading ? 'Generating (up to 90s)...' : 'Generate Practice Quiz'),
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
                        Text('AI is creating your personalized practice quiz...'),
                      ],
                    ))
                  : _result != null
                      ? AiResultCard(
                          title: 'Practice Quiz Generated',
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