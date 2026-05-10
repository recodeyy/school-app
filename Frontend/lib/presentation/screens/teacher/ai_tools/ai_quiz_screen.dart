import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/providers.dart';
import '../../../../data/models/school_model.dart';
import '../../../widgets/ai_result_card.dart';

class AiQuizScreen extends ConsumerStatefulWidget {
  const AiQuizScreen({super.key});

  @override
  ConsumerState<AiQuizScreen> createState() => _AiQuizScreenState();
}

class _AiQuizScreenState extends ConsumerState<AiQuizScreen> {
  final _formKey = GlobalKey<FormState>();
  
  SchoolClass? _selectedClass;
  Subject? _selectedSubject;
  List<SchoolClass> _classes = [];
  List<Subject> _subjects = [];
  
  final _chapterController = TextEditingController();
  final _countController = TextEditingController(text: '10');
  String _difficulty = 'medium';
  final List<String> _types = ['mcq'];
  
  bool _isLoading = false;
  Map<String, dynamic>? _result;

  @override
  void initState() {
    super.initState();
    _fetchClasses();
  }

  Future<void> _fetchClasses() async {
    try {
      final classes = await ref.read(schoolSetupServiceProvider).getClasses();
      setState(() => _classes = classes);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load classes: $e')));
    }
  }

  Future<void> _fetchSubjects(String classId) async {
    try {
      final subjects = await ref.read(schoolSetupServiceProvider).getSubjects(classId: classId);
      setState(() {
        _subjects = subjects;
        _selectedSubject = null;
      });
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load subjects: $e')));
    }
  }

  Future<void> _generate() async {
    if (!_formKey.currentState!.validate() || _selectedSubject == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all required fields')));
      return;
    }

    setState(() {
      _isLoading = true;
      _result = null;
    });

    try {
      final result = await ref.read(aiServiceProvider).generateQuiz(
        subjectId: _selectedSubject!.id,
        chapter: _chapterController.text,
        difficulty: _difficulty,
        questionCount: int.tryParse(_countController.text) ?? 10,
        types: _types,
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
      appBar: AppBar(title: const Text('AI Quiz Generator')),
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
                    DropdownButtonFormField<SchoolClass>(
                      initialValue: _selectedClass,
                      decoration: const InputDecoration(labelText: 'Select Class (Optional)'),
                      items: _classes.map((c) => DropdownMenuItem(value: c, child: Text(c.name))).toList(),
                      onChanged: (val) {
                        setState(() => _selectedClass = val);
                        if (val != null) _fetchSubjects(val.id);
                      },
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<Subject>(
                      initialValue: _selectedSubject,
                      decoration: const InputDecoration(labelText: 'Select Subject *'),
                      items: _subjects.map((s) => DropdownMenuItem(value: s, child: Text(s.name))).toList(),
                      onChanged: (val) => setState(() => _selectedSubject = val),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _chapterController,
                      decoration: const InputDecoration(labelText: 'Chapter / Topic *'),
                      validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _countController,
                      decoration: const InputDecoration(labelText: 'Number of Questions'),
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      initialValue: _difficulty,
                      decoration: const InputDecoration(labelText: 'Difficulty'),
                      items: ['easy', 'medium', 'hard'].map((d) => DropdownMenuItem(value: d, child: Text(d.toUpperCase()))).toList(),
                      onChanged: (val) => setState(() => _difficulty = val!),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: _isLoading ? null : _generate,
                      icon: _isLoading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.auto_awesome),
                      label: Text(_isLoading ? 'Generating (up to 90s)...' : 'Generate Quiz'),
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
                        Text('AI is creating your quiz...'),
                      ],
                    ))
                  : _result != null
                      ? AiResultCard(
                          title: 'Quiz Generated',
                          content: _result,
                          onRegenerate: _generate,
                        )
                      : const Center(child: Text('Fill out the form and click Generate.')),
            ),
          ),
        ],
      ),
    );
  }
}