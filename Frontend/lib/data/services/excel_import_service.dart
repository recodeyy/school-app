import '../../core/constants/api_constants.dart';
import 'api_service.dart';

class ExcelImportService {
  final ApiService _apiService;

  ExcelImportService(this._apiService);

  Future<void> importStudents(String csvData) async {
    await _apiService.post(
      '${ApiConstants.students}/bulk',
      body: {'csvData': csvData},
    );
  }

  Future<void> importTeachers(String csvData) async {
    await _apiService.post(
      '${ApiConstants.teachers}/bulk',
      body: {'csvData': csvData},
    );
  }

  Future<void> importStaff(String csvData) async {
    await _apiService.post(
      '${ApiConstants.staff}/bulk',
      body: {'csvData': csvData},
    );
  }

  Future<void> importParents(String csvData) async {
    await _apiService.post(
      '${ApiConstants.parents}/bulk',
      body: {'csvData': csvData},
    );
  }
}
