import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/providers.dart';
import '../../../../data/models/school_model.dart';
import '../../../widgets/ai_result_card.dart';

class AiQuestionPaperScreen extends ConsumerStatefulWidget {
  const AiQuestionPaperScreen({super.key});

  @override
  ConsumerState<AiQuestionPaperScreen> createState() => _AiQuestionPaperScreenState();
}

class _AiQuestionPaperScreenState extends ConsumerState<AiQuestionPaperScreen> {
  final _formKey = GlobalKey<FormState>();
  
  SchoolClass? _selectedClass;
  Subject? _selectedSubject;
  List<SchoolClass> _classes = [];
  List<Subject> _subjects = [];
  
  final _chaptersController = TextEditingController();
  final _totalMarksController = TextEditingController(text: '100');
  
  String _examType = 'final';
  bool _includeAnswerKey = true;
  
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
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all required fields.')));
      return;
    }

    setState(() {
      _isLoading = true;
      _result = null;
    });

    try {
      final chaptersList = _chaptersController.text.isNotEmpty 
          ? _chaptersController.text.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList() 
          : <String>['Entire Syllabus'];

      final result = await ref.read(aiServiceProvider).generateQuestionPaper(
        classId: _selectedClass!.id,
        subjectId: _selectedSubject!.id,
        examType: _examType,
        totalMarks: int.tryParse(_totalMarksController.text) ?? 100,
        chapters: chaptersList,
        sectionConfig: [
          {'name': 'Section A (MCQs)', 'questionType': 'mcq', 'count': 10, 'marksPerQuestion': 1},
          {'name': 'Section B (Short Answers)', 'questionType': 'short', 'count': 5, 'marksPerQuestion': 4},
          {'name': 'Section C (Long Answers)', 'questionType': 'long', 'count': 2, 'marksPerQuestion': 10},
        ],
        includeAnswerKey: _includeAnswerKey,
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
      appBar: AppBar(title: const Text('AI Question Paper Generator')),
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
                      decoration: const InputDecoration(labelText: 'Select Class *'),
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
                    DropdownButtonFormField<String>(
                      initialValue: _examType,
                      decoration: const InputDecoration(labelText: 'Exam Type'),
                      items: ['unit', 'midterm', 'final', 'practical'].map((t) => DropdownMenuItem(value: t, child: Text(t.toUpperCase()))).toList(),
                      onChanged: (val) => setState(() => _examType = val!),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _totalMarksController,
                      decoration: const InputDecoration(labelText: 'Total Marks'),
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _chaptersController,
                      decoration: const InputDecoration(labelText: 'Chapters (Comma separated)'),
                    ),
                    const SizedBox(height: 16),
                    SwitchListTile(
                      title: const Text('Include Answer Key'),
                      value: _includeAnswerKey,
                      onChanged: (val) => setState(() => _includeAnswerKey = val),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: _isLoading ? null : _generate,
                      icon: _isLoading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.description),
                      label: Text(_isLoading ? 'Generating (up to 90s)...' : 'Generate Question Paper'),
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
                        Text('AI is generating the question paper...'),
                      ],
                    ))
                  : _result != null
                      ? AiResultCard(
                          title: 'Question Paper Generated',
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