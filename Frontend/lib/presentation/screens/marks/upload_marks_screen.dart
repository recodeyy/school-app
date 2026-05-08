import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../data/models/school_model.dart';
import '../../../../data/models/user_model.dart';
import '../../../../data/models/marks_model.dart';
import '../../../../core/constants/app_theme.dart';
import '../../../../core/providers/providers.dart';

class UploadMarksScreen extends ConsumerStatefulWidget {
  const UploadMarksScreen({super.key});

  @override
  ConsumerState<UploadMarksScreen> createState() => _UploadMarksScreenState();
}

class _UploadMarksScreenState extends ConsumerState<UploadMarksScreen> {
  SchoolClass? _selectedClass;
  Exam? _selectedExam;
  Subject? _selectedSubject;
  List<SchoolClass> _classes = [];
  List<Exam> _exams = [];
  List<Subject> _subjects = [];
  List<User> _students = [];
  Map<String, TextEditingController> _marksControllers = {};
  bool _isLoading = false;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadClasses();
  }

  @override
  void dispose() {
    for (var c in _marksControllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _loadClasses() async {
    setState(() => _isLoading = true);
    try {
      final classes = await ref.read(schoolSetupServiceProvider).getClasses();
      setState(() {
        _classes = classes;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading classes: $e')),
        );
      }
    }
  }

  Future<void> _loadExamsAndSubjects(String classId) async {
    try {
      final exams = await ref.read(marksServiceProvider).getExams(classId: classId);
      final subjects = await ref.read(schoolSetupServiceProvider).getSubjects(classId: classId);
      setState(() {
        _exams = exams;
        _subjects = subjects;
        _selectedExam = null;
        _selectedSubject = null;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading exams/subjects: $e')),
        );
      }
    }
  }

  Future<void> _loadStudents(String classId) async {
    setState(() => _isLoading = true);
    try {
      final students = await ref.read(userServiceProvider).getStudentsByClass(classId);
      setState(() {
        _students = students;
        _marksControllers = {
          for (var s in students) s.id: TextEditingController()
        };
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading students: $e')),
        );
      }
    }
  }

  Future<void> _saveMarks() async {
    if (_selectedExam == null || _selectedSubject == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select exam and subject')),
      );
      return;
    }

    setState(() => _isSaving = true);
    try {
      final marks = _marksControllers.entries
          .where((e) => e.value.text.isNotEmpty)
          .map((e) => {
                'studentId': e.key,
                'subjectId': _selectedSubject!.id,
                'marksObtained': e.value.text,
              })
          .toList();

      if (marks.isEmpty) {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enter marks for at least one student')),
        );
        return;
      }

      await ref.read(marksServiceProvider).uploadMarks(
            examId: _selectedExam!.id,
            marks: marks,
          );

      setState(() => _isSaving = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Marks uploaded successfully'), backgroundColor: AppColors.success),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      setState(() => _isSaving = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error uploading marks: $e'), backgroundColor: AppColors.error),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Upload Marks'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                DropdownButtonFormField<SchoolClass>(
                  initialValue: _selectedClass,
                  decoration: const InputDecoration(labelText: 'Select Class'),
                  items: _classes.map((c) => DropdownMenuItem(value: c, child: Text(c.name))).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedClass = value;
                      _students = [];
                    });
                    if (value != null) {
                      _loadExamsAndSubjects(value.id);
                      _loadStudents(value.id);
                    }
                  },
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<Exam>(
                        initialValue: _selectedExam,
                        decoration: const InputDecoration(labelText: 'Select Exam'),
                        items: _exams.map((e) => DropdownMenuItem(value: e, child: Text(e.name))).toList(),
                        onChanged: (value) => setState(() => _selectedExam = value),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: DropdownButtonFormField<Subject>(
                        initialValue: _selectedSubject,
                        decoration: const InputDecoration(labelText: 'Select Subject'),
                        items: _subjects.map((s) => DropdownMenuItem(value: s, child: Text(s.name))).toList(),
                        onChanged: (value) => setState(() => _selectedSubject = value),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (_isLoading)
            const Expanded(child: Center(child: CircularProgressIndicator()))
          else if (_students.isEmpty && _selectedClass != null)
            const Expanded(child: Center(child: Text('No students found in this class')))
          else if (_students.isNotEmpty)
            Expanded(
              child: ListView.builder(
                itemCount: _students.length,
                itemBuilder: (context, index) {
                  final student = _students[index];
                  return ListTile(
                    title: Text(student.name),
                    subtitle: Text('Roll No: ${student.studentProfile?.rollNumber ?? 'N/A'}'),
                    trailing: SizedBox(
                      width: 80,
                      child: TextFormField(
                        controller: _marksControllers[student.id],
                        keyboardType: TextInputType.number,
                        textAlign: TextAlign.center,
                        decoration: const InputDecoration(
                          hintText: 'Marks',
                          contentPadding: EdgeInsets.zero,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
        ],
      ),
      bottomNavigationBar: _students.isNotEmpty
          ? Padding(
              padding: const EdgeInsets.all(16.0),
              child: ElevatedButton(
                onPressed: _isSaving ? null : _saveMarks,
                child: _isSaving
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Upload Marks'),
              ),
            )
          : null,
    );
  }
}
