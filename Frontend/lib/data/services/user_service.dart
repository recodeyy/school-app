import '../../core/constants/api_constants.dart';
import '../models/user_model.dart';
import 'api_service.dart';

class UserService {
  final ApiService _apiService;

  UserService(this._apiService);

  Future<List<User>> getUsers({
    String? role,
    String? classId,
    String? search,
    int page = 1,
    int limit = 20,
  }) async {
    final queryParams = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
    };
    if (role != null) queryParams['role'] = role;
    if (classId != null) queryParams['classId'] = classId;
    if (search != null) queryParams['search'] = search;

    final response = await _apiService.get(
      ApiConstants.users,
      queryParams: queryParams,
    );

    final List<dynamic> data = response['data'] ?? response;
    return data.map((json) => User.fromJson(json)).toList();
  }

  Future<User> getUserById(String id) async {
    final response = await _apiService.get('${ApiConstants.users}/$id');
    return User.fromJson(response);
  }

  Future<List<User>> getStudentsByClass(String classId) async {
    final response = await _apiService.get(
      '${ApiConstants.users}/class/$classId/students',
    );
    final List<dynamic> data = response is List ? response : response['data'] ?? [];
    return data.map((json) => User.fromJson(json)).toList();
  }

  Future<List<User>> getParentChildren(String parentId) async {
    final response = await _apiService.get(
      '${ApiConstants.users}/$parentId/children',
    );
    final List<dynamic> data = response is List ? response : response['data'] ?? [];
    return data.map((json) => User.fromJson(json)).toList();
  }

  Future<User> getStudentGuardian(String studentId) async {
    final response = await _apiService.get(
      '${ApiConstants.users}/$studentId/guardian',
    );
    return User.fromJson(response);
  }

  Future<User> createStudent(Map<String, dynamic> data) async {
    final response = await _apiService.post(
      ApiConstants.students,
      body: data,
    );
    return User.fromJson(response);
  }

  Future<User> createParent(Map<String, dynamic> data) async {
    final response = await _apiService.post(
      ApiConstants.parents,
      body: data,
    );
    return User.fromJson(response);
  }

  Future<User> createTeacher(Map<String, dynamic> data) async {
    final response = await _apiService.post(
      ApiConstants.teachers,
      body: data,
    );
    return User.fromJson(response);
  }

  Future<User> createStaff(Map<String, dynamic> data) async {
    final response = await _apiService.post(
      ApiConstants.staff,
      body: data,
    );
    return User.fromJson(response);
  }

  Future<void> mapParentToStudents(String parentId, List<String> studentIds) async {
    await _apiService.patch(
      '${ApiConstants.users}/$parentId/map-students',
      body: {'studentIds': studentIds},
    );
  }

  Future<void> updateUserStatus(String userId, bool isActive) async {
    await _apiService.patch(
      '${ApiConstants.users}/$userId/status',
      body: {'isActive': isActive},
    );
  }
}
