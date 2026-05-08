import '../../core/constants/api_constants.dart';
import '../models/school_model.dart';
import 'api_service.dart';

class SchoolSetupService {
  final ApiService _apiService;

  SchoolSetupService(this._apiService);

  Future<List<SchoolClass>> getClasses() async {
    final response = await _apiService.get(ApiConstants.classes);
    final List<dynamic> data = response is List ? response : response['data'] ?? [];
    return data.map((json) => SchoolClass.fromJson(json)).toList();
  }

  Future<SchoolClass> createClass({
    required String name,
    String? academicYear,
  }) async {
    final response = await _apiService.post(
      ApiConstants.classes,
      body: {
        'name': name,
        'academicYear': academicYear,
      },
    );
    return SchoolClass.fromJson(response);
  }

  Future<List<Subject>> getSubjects({String? classId}) async {
    final queryParams = <String, String>{};
    if (classId != null) queryParams['classId'] = classId;

    final response = await _apiService.get(
      ApiConstants.subjects,
      queryParams: queryParams,
    );
    final List<dynamic> data = response is List ? response : response['data'] ?? [];
    return data.map((json) => Subject.fromJson(json)).toList();
  }

  Future<Subject> createSubject({
    required String name,
    required String code,
    required String classId,
    String? teacherId,
  }) async {
    final response = await _apiService.post(
      ApiConstants.subjects,
      body: {
        'name': name,
        'code': code,
        'classId': classId,
        'teacherId': teacherId,
      },
    );
    return Subject.fromJson(response);
  }

  Future<List<AcademicYear>> getAcademicYears() async {
    final response = await _apiService.get(ApiConstants.academicYears);
    final List<dynamic> data = response is List ? response : response['data'] ?? [];
    return data.map((json) => AcademicYear.fromJson(json)).toList();
  }

  Future<AcademicYear> createAcademicYear({
    required String name,
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    final response = await _apiService.post(
      ApiConstants.academicYears,
      body: {
        'name': name,
        'startDate': startDate.toIso8601String().split('T')[0],
        'endDate': endDate.toIso8601String().split('T')[0],
      },
    );
    return AcademicYear.fromJson(response);
  }

  Future<List<Holiday>> getHolidays() async {
    final response = await _apiService.get(ApiConstants.holidays);
    final List<dynamic> data = response is List ? response : response['data'] ?? [];
    return data.map((json) => Holiday.fromJson(json)).toList();
  }

  Future<Holiday> createHoliday({
    required String name,
    required DateTime date,
    String? description,
  }) async {
    final response = await _apiService.post(
      ApiConstants.holidays,
      body: {
        'name': name,
        'date': date.toIso8601String().split('T')[0],
        'description': description,
      },
    );
    return Holiday.fromJson(response);
  }

  Future<List<Period>> getPeriods() async {
    final response = await _apiService.get(ApiConstants.periods);
    final List<dynamic> data = response is List ? response : response['data'] ?? [];
    return data.map((json) => Period.fromJson(json)).toList();
  }

  Future<Period> createPeriod({
    required String name,
    required String startTime,
    required String endTime,
    required int order,
  }) async {
    final response = await _apiService.post(
      ApiConstants.periods,
      body: {
        'name': name,
        'startTime': startTime,
        'endTime': endTime,
        'order': order,
      },
    );
    return Period.fromJson(response);
  }

  Future<List<Section>> getSections({String? classId}) async {
    final queryParams = <String, String>{};
    if (classId != null) queryParams['classId'] = classId;

    final response = await _apiService.get(
      ApiConstants.sections,
      queryParams: queryParams,
    );
    final List<dynamic> data = response is List ? response : response['data'] ?? [];
    return data.map((json) => Section.fromJson(json)).toList();
  }

  Future<Section> createSection({
    required String name,
    String? classId,
  }) async {
    final response = await _apiService.post(
      ApiConstants.sections,
      body: {
        'name': name,
        'classId': classId,
      },
    );
    return Section.fromJson(response);
  }
}
