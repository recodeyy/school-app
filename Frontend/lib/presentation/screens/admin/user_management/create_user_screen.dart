import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_theme.dart';
import '../../../../core/providers/providers.dart';
import '../../../../core/constants/user_role.dart';
import '../../../../data/models/school_model.dart';
import '../../../../core/utils/validation_service.dart';

class CreateUserScreen extends ConsumerStatefulWidget {
  const CreateUserScreen({super.key});

  @override
  ConsumerState<CreateUserScreen> createState() => _CreateUserScreenState();
}

class _CreateUserScreenState extends ConsumerState<CreateUserScreen> {
  final _formKey = GlobalKey<FormState>();
  UserRole _selectedRole = UserRole.student;
  
  // Controllers
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneController = TextEditingController();
  
  // Student specific
  SchoolClass? _selectedClass;
  final _rollNumberController = TextEditingController();
  final _admissionNumberController = TextEditingController();
  final _dobController = TextEditingController();
  
  // Teacher specific
  final _employeeIdController = TextEditingController();
  final _designationController = TextEditingController();
  
  // Parent specific
  final _relationshipController = TextEditingController();

  List<SchoolClass> _classes = [];
  bool _isLoading = false;

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
      // Log error
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _phoneController.dispose();
    _rollNumberController.dispose();
    _admissionNumberController.dispose();
    _dobController.dispose();
    _employeeIdController.dispose();
    _designationController.dispose();
    _relationshipController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final Map<String, dynamic> userData = {
        'name': _nameController.text.trim(),
        'email': _emailController.text.trim(),
        'password': _passwordController.text.trim(),
        'phone': _phoneController.text.trim(),
        'role': _selectedRole.name.toUpperCase(),
      };

      if (_selectedRole == UserRole.student) {
        userData.addAll({
          'classId': _selectedClass?.id,
          'rollNumber': _rollNumberController.text.trim(),
          'admissionNumber': _admissionNumberController.text.trim(),
          'dob': _dobController.text.trim(),
        });
        await ref.read(userServiceProvider).createStudent(userData);
      } else if (_selectedRole == UserRole.teacher) {
        userData.addAll({
          'employeeId': _employeeIdController.text.trim(),
          'designation': _designationController.text.trim(),
        });
        await ref.read(userServiceProvider).createTeacher(userData);
      } else if (_selectedRole == UserRole.parent) {
        userData.addAll({
          'relationship': _relationshipController.text.trim(),
        });
        await ref.read(userServiceProvider).createParent(userData);
      } else {
        await ref.read(userServiceProvider).createStaff(userData);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('User created successfully'), backgroundColor: AppColors.success),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error creating user: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create User')),
      body: _isLoading 
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    DropdownButtonFormField<UserRole>(
                      initialValue: _selectedRole,
                      decoration: const InputDecoration(labelText: 'Role'),
                      items: UserRole.values.map((role) => DropdownMenuItem(
                        value: role,
                        child: Text(role.displayName),
                      )).toList(),
                      onChanged: (value) => setState(() => _selectedRole = value!),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(labelText: 'Full Name'),
                      validator: (v) => ValidationService.validateRequired(v, 'Full Name'),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _emailController,
                      decoration: const InputDecoration(labelText: 'Email'),
                      validator: ValidationService.validateEmail,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _passwordController,
                      obscureText: true,
                      decoration: const InputDecoration(labelText: 'Password'),
                      validator: ValidationService.validatePassword,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _phoneController,
                      decoration: const InputDecoration(labelText: 'Phone (Optional)'),
                      validator: ValidationService.validatePhone,
                    ),
                    const SizedBox(height: 24),
                    const Divider(),
                    const SizedBox(height: 16),
                    Text(
                      '${_selectedRole.displayName} Details',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    if (_selectedRole == UserRole.student) ...[
                      DropdownButtonFormField<SchoolClass>(
                        initialValue: _selectedClass,
                        decoration: const InputDecoration(labelText: 'Class'),
                        items: _classes.map((c) => DropdownMenuItem(value: c, child: Text(c.name))).toList(),
                        onChanged: (v) => setState(() => _selectedClass = v),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _rollNumberController,
                        decoration: const InputDecoration(labelText: 'Roll Number'),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _admissionNumberController,
                        decoration: const InputDecoration(labelText: 'Admission Number'),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _dobController,
                        decoration: const InputDecoration(labelText: 'DOB (YYYY-MM-DD)'),
                      ),
                    ],
                    if (_selectedRole == UserRole.teacher || _selectedRole == UserRole.admin || _selectedRole == UserRole.staff) ...[
                      TextFormField(
                        controller: _employeeIdController,
                        decoration: const InputDecoration(labelText: 'Employee ID'),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _designationController,
                        decoration: const InputDecoration(labelText: 'Designation'),
                      ),
                    ],
                    if (_selectedRole == UserRole.parent) ...[
                      TextFormField(
                        controller: _relationshipController,
                        decoration: const InputDecoration(labelText: 'Relationship (e.g. Father)'),
                      ),
                    ],
                    const SizedBox(height: 32),
                    ElevatedButton(
                      onPressed: _submit,
                      child: const Padding(
                        padding: EdgeInsets.all(16.0),
                        child: Text('Create User'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
