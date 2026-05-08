import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/services/api_service.dart';
import '../../data/services/auth_service.dart';
import '../../data/services/user_service.dart';
import '../../data/services/attendance_service.dart';
import '../../data/services/homework_service.dart';
import '../../data/services/marks_service.dart';
import '../../data/services/notice_service.dart';
import '../../data/services/fee_service.dart';
import '../../data/services/notification_service.dart';
import '../../data/services/dashboard_service.dart';
import '../../data/services/school_setup_service.dart';
import '../../data/services/timetable_service.dart';

final apiServiceProvider = Provider((ref) => ApiService());

final authServiceProvider = Provider((ref) {
  final api = ref.watch(apiServiceProvider);
  return AuthService(api);
});

final userServiceProvider = Provider((ref) {
  final api = ref.watch(apiServiceProvider);
  return UserService(api);
});

final attendanceServiceProvider = Provider((ref) {
  final api = ref.watch(apiServiceProvider);
  return AttendanceService(api);
});

final homeworkServiceProvider = Provider((ref) {
  final api = ref.watch(apiServiceProvider);
  return HomeworkService(api);
});

final marksServiceProvider = Provider((ref) {
  final api = ref.watch(apiServiceProvider);
  return MarksService(api);
});

final noticeServiceProvider = Provider((ref) {
  final api = ref.watch(apiServiceProvider);
  return NoticeService(api);
});

final feeServiceProvider = Provider((ref) {
  final api = ref.watch(apiServiceProvider);
  return FeeService(api);
});

final notificationServiceProvider = Provider((ref) {
  final api = ref.watch(apiServiceProvider);
  return NotificationService(api);
});

final dashboardServiceProvider = Provider((ref) {
  final api = ref.watch(apiServiceProvider);
  return DashboardService(api);
});

final schoolSetupServiceProvider = Provider((ref) {
  final api = ref.watch(apiServiceProvider);
  return SchoolSetupService(api);
});

final timetableServiceProvider = Provider((ref) {
  final api = ref.watch(apiServiceProvider);
  return TimetableService(api);
});
