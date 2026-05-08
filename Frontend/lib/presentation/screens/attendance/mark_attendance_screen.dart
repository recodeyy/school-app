import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../data/models/school_model.dart';
import '../../../../data/models/user_model.dart';
import '../../../../core/constants/app_theme.dart';
import '../../../../core/providers/providers.dart';

class MarkAttendanceScreen extends ConsumerStatefulWidget {
  const MarkAttendanceScreen({super.key});

  @override
  ConsumerState<MarkAttendanceScreen> createState() => _MarkAttendanceScreenState();
}

class _MarkAttendanceScreenState extends ConsumerState<MarkAttendanceScreen> {
  SchoolClass? _selectedClass;
  Subject? _selectedSubject;
  List<SchoolClass> _classes = [];
  List<Subject> _subjects = [];
  List<User> _students = [];
  Map<String, String> _attendanceMap = {}; // studentId -> status
  bool _isLoading = false;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
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

  Future<void> _loadSubjects(String classId) async {
    try {
      final subjects = await ref.read(schoolSetupServiceProvider).getSubjects(classId: classId);
      setState(() {
        _subjects = subjects;
        _selectedSubject = null;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading subjects: $e')),
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
        _attendanceMap = {for (var s in students) s.id: 'PRESENT'};
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

  Future<void> _saveAttendance() async {
    if (_selectedClass == null) return;

    setState(() => _isSaving = true);
    try {
      final attendanceService = ref.read(attendanceServiceProvider);
      final session = await attendanceService.createSession(
        classId: _selectedClass!.id,
        subjectId: _selectedSubject?.id,
        date: DateTime.now(),
        startTime: DateFormat('HH:mm').format(DateTime.now()),
      );

      for (var studentId in _attendanceMap.keys) {
        await attendanceService.markAttendance(
          sessionId: session.id,
          studentId: studentId,
          status: _attendanceMap[studentId]!,
        );
      }

      setState(() => _isSaving = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Attendance marked successfully'), backgroundColor: AppColors.success),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      setState(() => _isSaving = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving attendance: $e'), backgroundColor: AppColors.error),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mark Attendance'),
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
                      _loadSubjects(value.id);
                      _loadStudents(value.id);
                    }
                  },
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<Subject>(
                  initialValue: _selectedSubject,
                  decoration: const InputDecoration(labelText: 'Select Subject (Optional)'),
                  items: _subjects.map((s) => DropdownMenuItem(value: s, child: Text(s.name))).toList(),
                  onChanged: (value) => setState(() => _selectedSubject = value),
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
                  final status = _attendanceMap[student.id];
                  return ListTile(
                    title: Text(student.name),
                    subtitle: Text('Roll No: ${student.studentProfile?.rollNumber ?? 'N/A'}'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _buildStatusButton(student.id, 'PRESENT', Icons.check_circle, AppColors.success, status == 'PRESENT'),
                        const SizedBox(width: 8),
                        _buildStatusButton(student.id, 'ABSENT', Icons.cancel, AppColors.error, status == 'ABSENT'),
                      ],
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
                onPressed: _isSaving ? null : _saveAttendance,
                child: _isSaving
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Save Attendance'),
              ),
            )
          : null,
    );
  }

  Widget _buildStatusButton(String studentId, String status, IconData icon, Color color, bool isSelected) {
    return GestureDetector(
      onTap: () => setState(() => _attendanceMap[studentId] = status),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? color : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: isSelected ? Colors.white : color),
            const SizedBox(width: 4),
            Text(
              status,
              style: TextStyle(
                fontSize: 12,
                color: isSelected ? Colors.white : color,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
