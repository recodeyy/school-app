import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/dashboard_model.dart';
import 'service_providers.dart';

class AdminDashboardNotifier extends AsyncNotifier<AdminDashboardData> {
  @override
  Future<AdminDashboardData> build() async {
    return _fetch();
  }

  Future<AdminDashboardData> _fetch() async {
    final service = ref.read(dashboardServiceProvider);
    return await service.getAdminDashboard();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetch());
  }
}

final adminDashboardProvider = AsyncNotifierProvider<AdminDashboardNotifier, AdminDashboardData>(() {
  return AdminDashboardNotifier();
});

class StudentDashboardNotifier extends FamilyAsyncNotifier<StudentDashboardData, String> {
  @override
  Future<StudentDashboardData> build(String arg) async {
    return _fetch(arg);
  }

  Future<StudentDashboardData> _fetch(String studentId) async {
    final service = ref.read(dashboardServiceProvider);
    return await service.getStudentDashboard(studentId);
  }

  Future<void> refresh(String studentId) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetch(studentId));
  }
}

final studentDashboardProvider = AsyncNotifierProviderFamily<StudentDashboardNotifier, StudentDashboardData, String>(() {
  return StudentDashboardNotifier();
});

class TeacherDashboardNotifier extends FamilyAsyncNotifier<TeacherDashboardData, String> {
  @override
  Future<TeacherDashboardData> build(String arg) async {
    return _fetch(arg);
  }

  Future<TeacherDashboardData> _fetch(String teacherId) async {
    final service = ref.read(dashboardServiceProvider);
    return await service.getTeacherDashboard(teacherId);
  }

  Future<void> refresh(String teacherId) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetch(teacherId));
  }
}

final teacherDashboardProvider = AsyncNotifierProviderFamily<TeacherDashboardNotifier, TeacherDashboardData, String>(() {
  return TeacherDashboardNotifier();
});
