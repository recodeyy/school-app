import '../../core/constants/api_constants.dart';
import '../models/timetable_model.dart';
import 'api_service.dart';

class TimetableService {
  final ApiService _apiService;

  TimetableService(this._apiService);

  Future<List<TimetableEntry>> getClassTimetable(String classId) async {
    final response = await _apiService.get('${ApiConstants.timetable}/class/$classId');
    final List<dynamic> data = response is List ? response : response['data'] ?? [];
    return data.map((json) => TimetableEntry.fromJson(json)).toList();
  }

  Future<List<TimetableEntry>> getTeacherTimetable(String teacherId) async {
    final response = await _apiService.get('${ApiConstants.timetable}/teacher/$teacherId');
    final List<dynamic> data = response is List ? response : response['data'] ?? [];
    return data.map((json) => TimetableEntry.fromJson(json)).toList();
  }

  Future<void> createTimetableEntry(Map<String, dynamic> data) async {
    await _apiService.post(ApiConstants.timetable, body: data);
  }

  Future<void> updateTimetableEntry(String id, Map<String, dynamic> data) async {
    await _apiService.patch('${ApiConstants.timetable}/$id', body: data);
  }

  Future<void> deleteTimetableEntry(String id) async {
    await _apiService.delete('${ApiConstants.timetable}/$id');
  }
}
