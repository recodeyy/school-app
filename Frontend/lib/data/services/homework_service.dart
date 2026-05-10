import '../../core/constants/api_constants.dart';
import '../../core/utils/date_helper.dart';
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
        'dueDate': DateHelper.formatDateForApi(dueDate),
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
    final List<dynamic> data = response['data'] ?? [];
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
    final List<dynamic> data = response['data'] ?? [];
    return data.map((json) => Homework.fromJson(json)).toList();
  }

  Future<HomeworkSubmission> submitHomework({
    required String homeworkId,
    String? content,
    List<String>? attachments,
  }) async {
    final response = await _apiService.post(
      '${ApiConstants.homework}/$homeworkId/submit',
      body: {
        'content': content ?? '',
        'attachments': attachments ?? [],
      },
    );
    return HomeworkSubmission.fromJson(response);
  }

  Future<HomeworkSubmission> gradeHomework({
    required String homeworkId,
    required String studentId,
    required String grade,
    String? feedback,
  }) async {
    final response = await _apiService.post(
      '${ApiConstants.homework}/$homeworkId/grade/$studentId',
      body: {
        'grade': grade,
        'comment': feedback,
      },
    );
    return HomeworkSubmission.fromJson(response);
  }

  Future<List<HomeworkSubmission>> getSubmissions(String homeworkId) async {
    final response = await _apiService.get(
      '${ApiConstants.homework}/$homeworkId',
    );
    final List<dynamic> data = response['submissions'] ?? [];
    return data.map((json) => HomeworkSubmission.fromJson(json)).toList();
  }
}
