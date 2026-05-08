import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_theme.dart';
import '../../../../core/providers/providers.dart';
import '../../../../data/models/user_model.dart';
import '../../../../core/constants/user_role.dart';
import 'create_user_screen.dart';

class UserListScreen extends ConsumerStatefulWidget {
  const UserListScreen({super.key});

  @override
  ConsumerState<UserListScreen> createState() => _UserListScreenState();
}

class _UserListScreenState extends ConsumerState<UserListScreen> {
  UserRole? _selectedRole;
  final TextEditingController _searchController = TextEditingController();
  List<User> _users = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchUsers();
  }

  Future<void> _fetchUsers() async {
    setState(() => _isLoading = true);
    try {
      final users = await ref.read(userServiceProvider).getUsers(
        role: _selectedRole?.name.toUpperCase(),
        search: _searchController.text.isNotEmpty ? _searchController.text : null,
      );
      setState(() {
        _users = users;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error fetching users: $e'), backgroundColor: AppColors.error),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('User Management'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const CreateUserScreen()),
              ).then((_) => _fetchUsers());
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Search users...',
                      prefixIcon: const Icon(Icons.search),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onSubmitted: (_) => _fetchUsers(),
                  ),
                ),
                const SizedBox(width: 12),
                DropdownButton<UserRole?>(
                  value: _selectedRole,
                  hint: const Text('Role'),
                  items: [
                    const DropdownMenuItem(value: null, child: Text('All Roles')),
                    ...UserRole.values.map((role) => DropdownMenuItem(
                      value: role,
                      child: Text(role.displayName),
                    )),
                  ],
                  onChanged: (value) {
                    setState(() => _selectedRole = value);
                    _fetchUsers();
                  },
                ),
              ],
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _users.isEmpty
                    ? const Center(child: Text('No users found'))
                    : ListView.separated(
                        itemCount: _users.length,
                        separatorBuilder: (context, index) => const Divider(),
                        itemBuilder: (context, index) {
                          final user = _users[index];
                          return ListTile(
                            leading: CircleAvatar(
                              backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                              child: Text(user.name[0].toUpperCase(), style: const TextStyle(color: AppColors.primary)),
                            ),
                            title: Text(user.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text('${user.role} • ${user.email}'),
                            trailing: Switch(
                              value: user.isActive,
                              onChanged: (value) async {
                                await ref.read(userServiceProvider).updateUserStatus(user.id, value);
                                _fetchUsers();
                              },
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
