import '../../core/constants/api_constants.dart';
import '../models/dashboard_model.dart';
import 'api_service.dart';

class DashboardService {
  final ApiService _apiService;

  DashboardService(this._apiService);

  Future<AdminDashboardData> getAdminDashboard() async {
    final response = await _apiService.get('${ApiConstants.dashboard}/admin');
    return AdminDashboardData.fromJson(response);
  }

  Future<StudentDashboardData> getStudentDashboard(String studentId) async {
    final response = await _apiService.get('${ApiConstants.dashboard}/student');
    return StudentDashboardData.fromJson(response);
  }

  Future<TeacherDashboardData> getTeacherDashboard(String teacherId) async {
    final response = await _apiService.get('${ApiConstants.dashboard}/teacher');
    return TeacherDashboardData.fromJson(response);
  }

  Future<ParentDashboardData> getParentDashboard(String parentId) async {
    final response = await _apiService.get('${ApiConstants.dashboard}/parent');
    return ParentDashboardData.fromJson(response);
  }
}
