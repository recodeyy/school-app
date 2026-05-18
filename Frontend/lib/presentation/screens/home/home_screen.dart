import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../providers/auth_provider.dart';
import 'widgets/admin_dashboard.dart';
import 'widgets/teacher_dashboard.dart';
import 'widgets/student_dashboard.dart';
import 'widgets/parent_dashboard.dart';
import '../notifications/notification_list_screen.dart';
import '../notices/notice_list_screen.dart';
import '../timetable/timetable_screen.dart';
import '../timetable/student_timetable_screen.dart';
import '../profile/profile_screen.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final role = auth.user?.role ?? 'STUDENT';

    return Scaffold(
      appBar: AppBar(
        title: const Text('School App'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const NotificationListScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              ref.read(authProvider.notifier).logout();
            },
          ),
        ],
      ),
      body: _selectedIndex == 0 
          ? _buildDashboard(role)
          : _selectedIndex == 1
              ? _buildSchedule(role)
              : _selectedIndex == 2
                  ? const NoticeListScreen()
                  : const ProfileScreen(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            activeIcon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_month_outlined),
            activeIcon: Icon(Icons.calendar_month),
            label: 'Schedule',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.message_outlined),
            activeIcon: Icon(Icons.message),
            label: 'Notices',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildDashboard(String role) {
    switch (role) {
      case 'ADMISSION_COUNSELOR':
      case 'ADMIN':
      case 'PRINCIPAL':
      case 'SUPER_ADMIN':
        return const AdminDashboard();
      case 'TEACHER':
        return const TeacherDashboard();
      case 'PARENT':
        return const ParentDashboard();
      case 'STUDENT':
      default:
        return const StudentDashboard();
    }
  }

  Widget _buildSchedule(String role) {
    switch (role) {
      case 'STUDENT':
        return const StudentTimetableScreen();
      case 'PARENT':
        return const Center(child: Text('Select a child from Dashboard to view schedule.'));
      default:
        return const TimetableScreen();
    }
  }
}
