import 'api_service.dart';

class AiService {
  final ApiService _apiService;

  AiService(this._apiService);

  // Analytics
  Future<Map<String, dynamic>> generateProgressSummary(String studentId, {String? language}) async {
    return await _apiService.post(
      '/ai/analytics/progress-summary',
      body: {
        'studentId': studentId,
        'language': language ?? 'English',
      },
    );
  }

  Future<Map<String, dynamic>> analyzeAttendanceRisk(String studentId) async {
    return await _apiService.post(
      '/ai/analytics/attendance-risk',
      body: {'studentId': studentId},
    );
  }

  Future<Map<String, dynamic>> detectWeakSubjects(String studentId) async {
    return await _apiService.post(
      '/ai/analytics/weak-subjects',
      body: {'studentId': studentId},
    );
  }

  // Admin Tools
  Future<Map<String, dynamic>> generateNotice({
    required String topic,
    required String audience,
    String? language,
  }) async {
    return await _apiService.post(
      '/ai/admin/notice',
      body: {
        'topic': topic,
        'audience': audience,
        'language': language ?? 'English',
      },
    );
  }
}
