import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_theme.dart';
import '../../../../core/providers/providers.dart';
import '../../../../data/models/school_model.dart';

class ManageSubjectsScreen extends ConsumerStatefulWidget {
  const ManageSubjectsScreen({super.key});

  @override
  ConsumerState<ManageSubjectsScreen> createState() => _ManageSubjectsScreenState();
}

class _ManageSubjectsScreenState extends ConsumerState<ManageSubjectsScreen> {
  List<Subject> _subjects = [];
  List<SchoolClass> _classes = [];
  SchoolClass? _selectedClass;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchInitialData();
  }

  Future<void> _fetchInitialData() async {
    setState(() => _isLoading = true);
    try {
      final classes = await ref.read(schoolSetupServiceProvider).getClasses();
      setState(() {
        _classes = classes;
        if (_classes.isNotEmpty) _selectedClass = _classes[0];
      });
      await _fetchSubjects();
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchSubjects() async {
    setState(() => _isLoading = true);
    try {
      final subjects = await ref.read(schoolSetupServiceProvider).getSubjects(
        classId: _selectedClass?.id,
      );
      setState(() {
        _subjects = subjects;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _showAddSubjectDialog() {
    final nameController = TextEditingController();
    final codeController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add New Subject'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            DropdownButtonFormField<SchoolClass>(
              initialValue: _selectedClass,
              decoration: const InputDecoration(labelText: 'Target Class'),
              items: _classes.map((c) => DropdownMenuItem(value: c, child: Text(c.name))).toList(),
              onChanged: (v) => setState(() => _selectedClass = v),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: nameController,
              decoration: const InputDecoration(labelText: 'Subject Name (e.g. Mathematics)'),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: codeController,
              decoration: const InputDecoration(labelText: 'Subject Code (e.g. MATH10)'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (nameController.text.isNotEmpty && _selectedClass != null) {
                await ref.read(schoolSetupServiceProvider).createSubject(
                  name: nameController.text.trim(),
                  code: codeController.text.trim(),
                  classId: _selectedClass!.id,
                );
                if (context.mounted) Navigator.pop(context);
                _fetchSubjects();
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Manage Subjects')),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddSubjectDialog,
        child: const Icon(Icons.add),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: DropdownButtonFormField<SchoolClass?>(
              initialValue: _selectedClass,
              decoration: const InputDecoration(labelText: 'Filter by Class'),
              items: [
                const DropdownMenuItem(value: null, child: Text('All Classes')),
                ..._classes.map((c) => DropdownMenuItem(value: c, child: Text(c.name))),
              ],
              onChanged: (v) {
                setState(() => _selectedClass = v);
                _fetchSubjects();
              },
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _subjects.isEmpty
                    ? const Center(child: Text('No subjects found'))
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: _subjects.length,
                        itemBuilder: (context, index) {
                          final sub = _subjects[index];
                          return Card(
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: AppColors.success.withValues(alpha: 0.1),
                                child: const Icon(Icons.book, color: AppColors.success),
                              ),
                              title: Text(sub.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                              subtitle: Text('Code: ${sub.code} • Class: ${sub.className ?? 'N/A'}'),
                              trailing: const Icon(Icons.edit_outlined),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
