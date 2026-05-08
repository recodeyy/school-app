import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_theme.dart';
import '../../../../core/providers/providers.dart';
import '../../../../core/constants/user_role.dart';

class ExcelImportScreen extends ConsumerStatefulWidget {
  const ExcelImportScreen({super.key});

  @override
  ConsumerState<ExcelImportScreen> createState() => _ExcelImportScreenState();
}

class _ExcelImportScreenState extends ConsumerState<ExcelImportScreen> {
  UserRole _selectedRole = UserRole.student;
  final TextEditingController _csvController = TextEditingController();
  bool _isLoading = false;

  Future<void> _import() async {
    if (_csvController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please paste CSV data'), backgroundColor: AppColors.error),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      final service = ref.read(excelImportServiceProvider);
      final data = _csvController.text.trim();

      switch (_selectedRole) {
        case UserRole.student:
          await service.importStudents(data);
          break;
        case UserRole.teacher:
          await service.importTeachers(data);
          break;
        case UserRole.parent:
          await service.importParents(data);
          break;
        case UserRole.staff:
        case UserRole.admin:
          await service.importStaff(data);
          break;
        default:
          throw 'Role not supported for bulk import';
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Bulk import successful'), backgroundColor: AppColors.success),
        );
        _csvController.clear();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Import failed: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Bulk Import (CSV)')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'Import users in bulk by pasting CSV data below.',
                    style: TextStyle(color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<UserRole>(
                    initialValue: _selectedRole,
                    decoration: const InputDecoration(labelText: 'Target Role'),
                    items: [UserRole.student, UserRole.teacher, UserRole.parent, UserRole.staff]
                        .map((role) => DropdownMenuItem(value: role, child: Text(role.displayName)))
                        .toList(),
                    onChanged: (v) => setState(() => _selectedRole = v!),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'CSV Data (Header required)',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Expanded(
                    child: TextField(
                      controller: _csvController,
                      maxLines: null,
                      expands: true,
                      textAlignVertical: TextAlignVertical.top,
                      decoration: InputDecoration(
                        hintText: _getHintForRole(_selectedRole),
                        border: const OutlineInputBorder(),
                        filled: true,
                        fillColor: Colors.grey[50],
                      ),
                      style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: _import,
                    icon: const Icon(Icons.upload_file),
                    label: const Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Text('Process CSV Import'),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  String _getHintForRole(UserRole role) {
    switch (role) {
      case UserRole.student:
        return 'name,email,password,className,phone,rollNumber,admissionNumber,dob\nJohn Doe,john@example.com,pass123,10-A,9876543210,1,ADM001,2008-05-15';
      case UserRole.teacher:
        return 'name,email,password,phone,employeeId,subjects,designation\nDr. Smith,smith@example.com,pass123,9876543210,EMP001,Mathematics,HOD';
      case UserRole.parent:
        return 'name,email,password,phone,relationship\nMr. Doe,parent@example.com,pass123,9876543210,Father';
      default:
        return 'name,email,password,phone,employeeId,designation,department';
    }
  }
}
