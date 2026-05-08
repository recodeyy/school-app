import 'package:shared_preferences/shared_preferences.dart';
import '../../core/constants/api_constants.dart';
import '../models/auth_model.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _apiService;

  AuthService(this._apiService);

  Future<LoginResponse> login(String email, String password) async {
    final response = await _apiService.post(
      ApiConstants.login,
      body: {'email': email, 'password': password},
      requiresAuth: false,
    );

    final tokens = AuthTokens.fromJson(response);
    await _apiService.setAccessToken(tokens.accessToken);

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.refreshTokenKey, tokens.refreshToken);
    await prefs.setString(AppConstants.userRoleKey, response['user']['role']);

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

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.refreshTokenKey, tokens.refreshToken);

    return tokens;
  }

  Future<void> logout() async {
    await _apiService.clearToken();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.userRoleKey);
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(AppConstants.tokenKey);
    return token != null && token.isNotEmpty;
  }

  Future<String?> getUserRole() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(AppConstants.userRoleKey);
  }

  Future<User> getProfile() async {
    final response = await _apiService.get(ApiConstants.profile);
    return User.fromJson(response);
  }
}
