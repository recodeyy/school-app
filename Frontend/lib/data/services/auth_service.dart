import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/constants/api_constants.dart';
import '../models/auth_model.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _apiService;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  AuthService(this._apiService);

  Future<LoginResponse> login(String email, String password) async {
    final response = await _apiService.post(
      ApiConstants.login,
      body: {'email': email, 'password': password},
      requiresAuth: false,
    );

    final tokens = AuthTokens.fromJson(response);
    await _apiService.setAccessToken(tokens.accessToken);

    await _storage.write(key: AppConstants.refreshTokenKey, value: tokens.refreshToken);
    await _storage.write(key: AppConstants.userRoleKey, value: response['user']['role']);

    return LoginResponse.fromJson(response);
  }

  Future<AuthTokens> refreshToken(String refreshToken) async {
    final response = await _apiService.post(
      ApiConstants.refresh,
      body: {'refreshToken': refreshToken},
      requiresAuth: false,
    );

    final tokens = AuthTokens.fromJson(response);
    await _apiService.setAccessToken(tokens.accessToken);

    await _storage.write(key: AppConstants.refreshTokenKey, value: tokens.refreshToken);

    return tokens;
  }

  Future<void> logout() async {
    await _apiService.clearToken();
    await _storage.delete(key: AppConstants.userRoleKey);
  }

  Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: AppConstants.tokenKey);
    return token != null && token.isNotEmpty;
  }

  Future<String?> getUserRole() async {
    return await _storage.read(key: AppConstants.userRoleKey);
  }

  Future<User> getProfile() async {
    final response = await _apiService.get(ApiConstants.profile);
    return User.fromJson(response);
  }
}
