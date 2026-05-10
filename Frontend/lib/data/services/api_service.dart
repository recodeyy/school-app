import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/constants/api_constants.dart';
import '../../core/errors/exceptions.dart';

class ApiService {
  final http.Client _client;
  String? _accessToken;
  
  final Map<String, dynamic> _cache = {};
  final Map<String, DateTime> _cacheTimestamps = {};
  static const Duration _cacheDuration = Duration(minutes: 5);

  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  static const String _cachePrefsKey = 'api_cache_data';
  static const String _cacheTimestampsPrefsKey = 'api_cache_timestamps';

  ApiService({http.Client? client}) : _client = client ?? http.Client();

  Future<void> initCache() async {
    final prefs = await SharedPreferences.getInstance();
    final cacheStr = prefs.getString(_cachePrefsKey);
    final timestampsStr = prefs.getString(_cacheTimestampsPrefsKey);
    
    if (cacheStr != null && timestampsStr != null) {
      try {
        final Map<String, dynamic> decodedCache = jsonDecode(cacheStr);
        final Map<String, dynamic> decodedTimestamps = jsonDecode(timestampsStr);
        
        _cache.addAll(decodedCache);
        decodedTimestamps.forEach((key, value) {
          _cacheTimestamps[key] = DateTime.parse(value);
        });
      } catch (e) {
        clearCache();
      }
    }
  }

  Future<void> _saveCache() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_cachePrefsKey, jsonEncode(_cache));
    
    final timestampsMap = _cacheTimestamps.map((key, value) => MapEntry(key, value.toIso8601String()));
    await prefs.setString(_cacheTimestampsPrefsKey, jsonEncode(timestampsMap));
  }

  Future<void> setAccessToken(String token) async {
    _accessToken = token;
    await _storage.write(key: AppConstants.tokenKey, value: token);
  }

  Future<String?> getAccessToken() async {
    if (_accessToken != null) return _accessToken;
    _accessToken = await _storage.read(key: AppConstants.tokenKey);
    return _accessToken;
  }

  Future<String?> _getRefreshToken() async {
    return await _storage.read(key: AppConstants.refreshTokenKey);
  }

  Future<void> clearToken() async {
    _accessToken = null;
    await _storage.delete(key: AppConstants.tokenKey);
    await _storage.delete(key: AppConstants.refreshTokenKey);
  }

  bool _isCacheValid(String key) {
    if (!_cacheTimestamps.containsKey(key)) return false;
    return DateTime.now().difference(_cacheTimestamps[key]!) < _cacheDuration;
  }

  void clearCache() async {
    _cache.clear();
    _cacheTimestamps.clear();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_cachePrefsKey);
    await prefs.remove(_cacheTimestampsPrefsKey);
  }

  Map<String, String> _getHeaders({bool requiresAuth = true}) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };
    if (requiresAuth && _accessToken != null) {
      headers['Authorization'] = 'Bearer $_accessToken';
    }
    return headers;
  }

  Future<dynamic> _retryRequest(Future<http.Response> Function() requestFunc, {int maxRetries = 3, Duration? timeout}) async {
    int attempt = 0;
    while (attempt < maxRetries) {
      try {
        final response = await requestFunc().timeout(timeout ?? ApiConstants.timeout);
        return await _handleResponse(response, requestFunc, timeout: timeout);
      } on TimeoutException {
        attempt++;
        if (attempt >= maxRetries) throw NetworkException(message: 'Request timed out after $maxRetries attempts');
        await Future.delayed(Duration(seconds: 1 << attempt)); // Exponential backoff
      }
    }
  }

  Future<dynamic> get(
    String endpoint, {
    bool requiresAuth = true,
    Map<String, String>? queryParams,
    bool useCache = false,
    Duration? timeout,
  }) async {
    final cacheKey = '$endpoint?${queryParams?.toString() ?? ''}';
    
    if (useCache && _isCacheValid(cacheKey)) {
      return _cache[cacheKey];
    }
    
    await getAccessToken();
    var uri = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    if (queryParams != null) {
      uri = uri.replace(queryParameters: queryParams);
    }
    
    try {
      final responseData = await _retryRequest(
        () => _client.get(uri, headers: _getHeaders(requiresAuth: requiresAuth)),
        timeout: timeout,
      );
      
      if (useCache) {
        _cache[cacheKey] = responseData;
        _cacheTimestamps[cacheKey] = DateTime.now();
        _saveCache();
      }
      
      return responseData;
    } catch (e) {
      if (e is ApiException) rethrow;
      if (e is TimeoutException) throw NetworkException(message: 'Request timed out. Please try again.');
      throw NetworkException(message: 'Unable to connect. Please check your internet.');
    }
  }

  Future<dynamic> post(
    String endpoint, {
    Map<String, dynamic>? body,
    bool requiresAuth = true,
    Duration? timeout,
  }) async {
    await getAccessToken();
    final uri = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    
    try {
      return await _retryRequest(
        () => _client.post(
          uri,
          headers: _getHeaders(requiresAuth: requiresAuth),
          body: body != null ? jsonEncode(body) : null,
        ),
        timeout: timeout,
      );
    } catch (e) {
      if (e is ApiException) rethrow;
      if (e is TimeoutException) throw NetworkException(message: 'Request timed out. Please try again.');
      throw NetworkException(message: 'Unable to connect. Please check your internet.');
    }
  }

  Future<dynamic> patch(
    String endpoint, {
    Map<String, dynamic>? body,
    bool requiresAuth = true,
  }) async {
    await getAccessToken();
    final uri = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    
    try {
      return await _retryRequest(
        () => _client.patch(
          uri,
          headers: _getHeaders(requiresAuth: requiresAuth),
          body: body != null ? jsonEncode(body) : null,
        )
      );
    } catch (e) {
      if (e is ApiException) rethrow;
      if (e is TimeoutException) throw NetworkException(message: 'Request timed out. Please try again.');
      throw NetworkException(message: 'Unable to connect. Please check your internet.');
    }
  }

  Future<dynamic> delete(
    String endpoint, {
    bool requiresAuth = true,
  }) async {
    await getAccessToken();
    final uri = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    
    try {
      return await _retryRequest(
        () => _client.delete(uri, headers: _getHeaders(requiresAuth: requiresAuth))
      );
    } catch (e) {
      if (e is ApiException) rethrow;
      if (e is TimeoutException) throw NetworkException(message: 'Request timed out. Please try again.');
      throw NetworkException(message: 'Unable to connect. Please check your internet.');
    }
  }

  Future<dynamic> _handleResponse(http.Response response, Future<http.Response> Function() originalRequest, {Duration? timeout}) async {
    final body = response.body.isNotEmpty ? jsonDecode(response.body) : null;

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    } else if (response.statusCode == 401) {
      try {
        final refreshToken = await _getRefreshToken();
        if (refreshToken == null) throw AuthException(message: 'Session expired');
        
        final refreshUri = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.refresh}');
        final refreshResponse = await _client.post(
          refreshUri,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'refreshToken': refreshToken}),
        ).timeout(ApiConstants.timeout);
        
        if (refreshResponse.statusCode >= 200 && refreshResponse.statusCode < 300) {
          final refreshBody = jsonDecode(refreshResponse.body);
          final newAccessToken = refreshBody['accessToken'] ?? refreshBody['data']?['accessToken'];
          if (newAccessToken != null) {
            await setAccessToken(newAccessToken);
            
            // Retry original request
            final retriedResponse = await originalRequest().timeout(timeout ?? ApiConstants.timeout);
            final retriedBody = retriedResponse.body.isNotEmpty ? jsonDecode(retriedResponse.body) : null;
            if (retriedResponse.statusCode >= 200 && retriedResponse.statusCode < 300) {
              return retriedBody;
            }
            throw _mapStatusCodeToException(retriedResponse.statusCode, retriedBody);
          }
        }
        throw AuthException(message: 'Session expired');
      } catch (e) {
        throw AuthException(message: 'Session expired');
      }
    } else {
      throw _mapStatusCodeToException(response.statusCode, body);
    }
  }
  
  ApiException _mapStatusCodeToException(int statusCode, dynamic body) {
    String message = body is Map ? (body['message'] ?? 'Request failed') : 'Request failed';
    
    // Provide user-friendly messages
    if (statusCode == 400 || statusCode == 422) {
      message = 'Invalid data submitted. Please check your inputs.';
      return ValidationException(message: message, data: body);
    } else if (statusCode == 401) {
      return AuthException(message: 'Your session expired. Please login again.');
    } else if (statusCode == 403) {
      message = 'You do not have permission to access this feature.';
      return ForbiddenException(message: message, data: body);
    } else if (statusCode == 404) {
      message = 'The requested resource was not found.';
      return NotFoundException(message: message, data: body);
    } else if (statusCode == 409) {
      message = 'Conflict with existing data.';
      return ConflictException(message: message, data: body);
    } else if (statusCode == 429) {
      message = 'Too many requests. Please wait before trying again.';
      return ApiException(message: message, statusCode: statusCode, data: body);
    } else if (statusCode >= 500) {
      message = 'Server error. Please try again later.';
      return ServerException(message: message, data: body, statusCode: statusCode);
    }
    
    return ApiException(
      message: message,
      statusCode: statusCode,
      data: body,
    );
  }
}
