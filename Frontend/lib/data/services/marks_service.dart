import '../../core/constants/api_constants.dart';
import '../models/marks_model.dart';
import 'api_service.dart';

class MarksService {
  final ApiService _apiService;

  MarksService(this._apiService);

  Future<Exam> createExam({
    required String name,
    required String classId,
    required String type,
    required String totalMarks,
    required DateTime examDate,
  }) async {
    final response = await _apiService.post(
      ApiConstants.marks,
      body: {
        'name': name,
        'classId': classId,
        'type': type,
        'totalMarks': totalMarks,
        'examDate': examDate.toIso8601String().split('T')[0],
      },
    );
    return Exam.fromJson(response);
  }

  Future<List<Exam>> getExams({String? classId}) async {
    final queryParams = <String, String>{};
    if (classId != null) queryParams['classId'] = classId;

    final response = await _apiService.get(
      ApiConstants.marks,
      queryParams: queryParams,
    );
    final List<dynamic> data = response is List ? response : response['data'] ?? [];
    return data.map((json) => Exam.fromJson(json)).toList();
  }

  Future<Exam> getExamById(String id) async {
    final response = await _apiService.get('${ApiConstants.marks}/$id');
    return Exam.fromJson(response);
  }

  Future<void> uploadMarks({
    required String examId,
    required List<Map<String, dynamic>> marks,
  }) async {
    await _apiService.post(
      '${ApiConstants.marks}/$examId/marks',
      body: {'marks': marks},
    );
  }

  Future<List<Mark>> getExamMarks(String examId) async {
    final response = await _apiService.get('${ApiConstants.marks}/$examId/marks');
    final List<dynamic> data = response is List ? response : response['data'] ?? [];
    return data.map((json) => Mark.fromJson(json)).toList();
  }

  Future<List<Result>> getStudentResults(String studentId) async {
    final response = await _apiService.get(
      '${ApiConstants.marks}/results/$studentId',
    );
    final List<dynamic> data = response is List ? response : response['data'] ?? [];
    return data.map((json) => Result.fromJson(json)).toList();
  }

  Future<void> publishResults(String examId) async {
    await _apiService.patch('${ApiConstants.marks}/$examId/publish');
  }
}
