import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_theme.dart';
import '../../../../core/providers/providers.dart';
import '../../../../data/models/school_model.dart';

class ManageClassesScreen extends ConsumerStatefulWidget {
  const ManageClassesScreen({super.key});

  @override
  ConsumerState<ManageClassesScreen> createState() => _ManageClassesScreenState();
}

class _ManageClassesScreenState extends ConsumerState<ManageClassesScreen> {
  List<SchoolClass> _classes = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchClasses();
  }

  Future<void> _fetchClasses() async {
    setState(() => _isLoading = true);
    try {
      final classes = await ref.read(schoolSetupServiceProvider).getClasses();
      setState(() {
        _classes = classes;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _showAddClassDialog() {
    final nameController = TextEditingController();
    final yearController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add New Class'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(labelText: 'Class Name (e.g. 10-A)'),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: yearController,
              decoration: const InputDecoration(labelText: 'Academic Year (Optional)'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (nameController.text.isNotEmpty) {
                await ref.read(schoolSetupServiceProvider).createClass(
                  name: nameController.text.trim(),
                  academicYear: yearController.text.trim(),
                );
                if (context.mounted) Navigator.pop(context);
                _fetchClasses();
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
      appBar: AppBar(title: const Text('Manage Classes')),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddClassDialog,
        child: const Icon(Icons.add),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _classes.isEmpty
              ? const Center(child: Text('No classes found'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _classes.length,
                  itemBuilder: (context, index) {
                    final cls = _classes[index];
                    return Card(
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                          child: const Icon(Icons.class_, color: AppColors.primary),
                        ),
                        title: Text(cls.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text(cls.academicYear ?? 'N/A'),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () {
                          // Could navigate to manage sections for this class
                        },
                      ),
                    );
                  },
                ),
    );
  }
}
