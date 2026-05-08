import '../../core/constants/api_constants.dart';
import '../models/homework_model.dart';
import 'api_service.dart';

class HomeworkService {
  final ApiService _apiService;

  HomeworkService(this._apiService);

  Future<Homework> createHomework({
    required String title,
    String? description,
    required String classId,
    String? subjectId,
    required DateTime dueDate,
    List<String>? attachments,
  }) async {
    final response = await _apiService.post(
      ApiConstants.homework,
      body: {
        'title': title,
        'description': description,
        'classId': classId,
        'subjectId': subjectId,
        'dueDate': dueDate.toIso8601String().split('T')[0],
        'attachments': attachments,
      },
    );
    return Homework.fromJson(response);
  }

  Future<List<Homework>> getHomeworkList({
    String? classId,
    String? subjectId,
    bool? isPublished,
  }) async {
    final queryParams = <String, String>{};
    if (classId != null) queryParams['classId'] = classId;
    if (subjectId != null) queryParams['subjectId'] = subjectId;
    if (isPublished != null) queryParams['isPublished'] = isPublished.toString();

    final response = await _apiService.get(
      ApiConstants.homework,
      queryParams: queryParams,
    );
    final List<dynamic> data = response is List ? response : response['data'] ?? [];
    return data.map((json) => Homework.fromJson(json)).toList();
  }

  Future<Homework> getHomeworkById(String id) async {
    final response = await _apiService.get('${ApiConstants.homework}/$id');
    return Homework.fromJson(response);
  }

  Future<List<Homework>> getStudentHomework(String studentId) async {
    final response = await _apiService.get(
      '${ApiConstants.homework}/student/$studentId',
    );
    final List<dynamic> data = response is List ? response : response['data'] ?? [];
    return data.map((json) => Homework.fromJson(json)).toList();
  }

  Future<HomeworkSubmission> submitHomework({
    required String homeworkId,
    required String studentId,
    String? content,
    List<String>? attachments,
  }) async {
    final response = await _apiService.post(
      '${ApiConstants.homework}/$homeworkId/submissions',
      body: {
        'studentId': studentId,
        'content': content,
        'attachments': attachments,
      },
    );
    return HomeworkSubmission.fromJson(response);
  }

  Future<HomeworkSubmission> gradeHomework({
    required String submissionId,
    required String grade,
    String? feedback,
  }) async {
    final response = await _apiService.patch(
      '${ApiConstants.homework}/submissions/$submissionId',
      body: {
        'grade': grade,
        'feedback': feedback,
      },
    );
    return HomeworkSubmission.fromJson(response);
  }

  Future<List<HomeworkSubmission>> getSubmissions(String homeworkId) async {
    final response = await _apiService.get(
      '${ApiConstants.homework}/$homeworkId/submissions',
    );
    final List<dynamic> data = response is List ? response : response['data'] ?? [];
    return data.map((json) => HomeworkSubmission.fromJson(json)).toList();
  }
}
