import '../../core/constants/api_constants.dart';
import '../../core/utils/date_helper.dart';
import '../models/attendance_model.dart';
import 'api_service.dart';

class AttendanceService {
  final ApiService _apiService;

  AttendanceService(this._apiService);

  Future<AttendanceSession> createSession({
    required String classId,
    String? subjectId,
    required DateTime date,
    required String startTime,
  }) async {
    final response = await _apiService.post(
      ApiConstants.attendance,
      body: {
        'classId': classId,
        'subjectId': subjectId,
        'date': DateHelper.formatDateForApi(date),
        'startTime': startTime,
      },
    );
    return AttendanceSession.fromJson(response);
  }

  Future<List<AttendanceSession>> getSessions({
    String? classId,
    String? subjectId,
    DateTime? date,
  }) async {
    final queryParams = <String, String>{};
    if (classId != null) queryParams['classId'] = classId;
    if (subjectId != null) queryParams['subjectId'] = subjectId;
    if (date != null) queryParams['date'] = DateHelper.formatDateForApi(date);

    final response = await _apiService.get(
      ApiConstants.attendance,
      queryParams: queryParams,
    );
    final List<dynamic> data = response['data'] ?? [];
    return data.map((json) => AttendanceSession.fromJson(json)).toList();
  }

  Future<void> markAttendance({
    required String sessionId,
    required String studentId,
    required String status,
    String? note,
  }) async {
    await _apiService.post(
      '${ApiConstants.attendance}/$sessionId/records',
      body: {
        'studentId': studentId,
        'status': status,
        'note': note,
      },
    );
  }

  Future<List<AttendanceRecord>> getStudentAttendance(String studentId) async {
    final response = await _apiService.get(
      '${ApiConstants.attendance}/student/$studentId',
    );
    final List<dynamic> data = response['data'] ?? [];
    return data.map((json) => AttendanceRecord.fromJson(json)).toList();
  }

  Future<Map<String, dynamic>> getAttendanceStats(String? classId) async {
    final queryParams = <String, String>{};
    if (classId != null) queryParams['classId'] = classId;

    final response = await _apiService.get(
      '${ApiConstants.attendance}/stats',
      queryParams: queryParams,
    );
    return response;
  }
}
