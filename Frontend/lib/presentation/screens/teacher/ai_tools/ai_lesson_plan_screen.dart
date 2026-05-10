import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/providers.dart';
import '../../../../data/models/school_model.dart';
import '../../../widgets/ai_result_card.dart';

class AiLessonPlanScreen extends ConsumerStatefulWidget {
  const AiLessonPlanScreen({super.key});

  @override
  ConsumerState<AiLessonPlanScreen> createState() => _AiLessonPlanScreenState();
}

class _AiLessonPlanScreenState extends ConsumerState<AiLessonPlanScreen> {
  final _formKey = GlobalKey<FormState>();
  
  SchoolClass? _selectedClass;
  Subject? _selectedSubject;
  List<SchoolClass> _classes = [];
  List<Subject> _subjects = [];
  
  final _chapterController = TextEditingController();
  final _durationController = TextEditingController(text: '45');
  
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
    if (!_formKey.currentState!.validate() || _selectedClass == null || _selectedSubject == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all required fields')));
      return;
    }

    setState(() {
      _isLoading = true;
      _result = null;
    });

    try {
      final result = await ref.read(aiServiceProvider).generateLessonPlan(
        classId: _selectedClass!.id,
        subjectId: _selectedSubject!.id,
        chapter: _chapterController.text,
        duration: int.tryParse(_durationController.text) ?? 45,
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
      appBar: AppBar(title: const Text('AI Lesson Planner')),
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
                      decoration: const InputDecoration(labelText: 'Select Class'),
                      items: _classes.map((c) => DropdownMenuItem(value: c, child: Text(c.name))).toList(),
                      onChanged: (val) {
                        setState(() => _selectedClass = val);
                        if (val != null) _fetchSubjects(val.id);
                      },
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<Subject>(
                      initialValue: _selectedSubject,
                      decoration: const InputDecoration(labelText: 'Select Subject'),
                      items: _subjects.map((s) => DropdownMenuItem(value: s, child: Text(s.name))).toList(),
                      onChanged: _selectedClass == null ? null : (val) => setState(() => _selectedSubject = val),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _chapterController,
                      decoration: const InputDecoration(labelText: 'Chapter / Topic'),
                      validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _durationController,
                      decoration: const InputDecoration(labelText: 'Duration (minutes)'),
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: _isLoading ? null : _generate,
                      icon: _isLoading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.auto_awesome),
                      label: Text(_isLoading ? 'Generating (up to 90s)...' : 'Generate Lesson Plan'),
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
                        Text('AI is creating your lesson plan...'),
                      ],
                    ))
                  : _result != null
                      ? AiResultCard(
                          title: 'Lesson Plan Generated',
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
