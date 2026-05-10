import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiConstants {
  static String get baseUrl {
    const bool isProduction = bool.fromEnvironment('dart.vm.product');
    if (isProduction) {
      return 'https://api.schoolapp.com/api'; // Production HTTPS URL
    }
    if (kIsWeb) {
      return 'http://localhost:4000/api';
    }
    // Cannot use Platform.isAndroid on web, so check kIsWeb first.
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:4000/api';
    }
    return 'http://localhost:4000/api';
  }
  static const Duration timeout = Duration(seconds: 30);

  static const String login = '/auth/login';
  static const String refresh = '/auth/refresh';
  static const String profile = '/auth/profile';
  static const String createAccount = '/auth/create';

  static const String users = '/users';
  static const String students = '/users/students';
  static const String parents = '/users/parents';
  static const String teachers = '/users/teachers';
  static const String staff = '/users/staff';

  static const String dashboard = '/dashboard';

  static const String attendance = '/attendance';
  static const String homework = '/homework';
  static const String marks = '/marks';
  static const String notices = '/notices';
  static const String fees = '/fees';
  static const String notifications = '/notifications';

  static const String classes = '/school-setup/classes';
  static const String subjects = '/school-setup/subjects';
  static const String sections = '/school-setup/sections';
  static const String academicYears = '/school-setup/academic-years';
  static const String holidays = '/school-setup/holidays';
  static const String periods = '/school-setup/periods';
  static const String timetable = '/timetable';
}

class AppConstants {
  static const String appName = 'School App';
  static const String tokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userKey = 'user_data';
  static const String userRoleKey = 'user_role';
}
