class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic data;

  ApiException({
    required this.message,
    this.statusCode,
    this.data,
  });

  @override
  String toString() => 'ApiException: $message (Status: $statusCode)';
}

class NetworkException implements Exception {
  final String message;

  NetworkException({this.message = 'Network error occurred'});

  @override
  String toString() => 'NetworkException: $message';
}

class AuthException extends ApiException {
  AuthException({required super.message}) : super(statusCode: 401);

  @override
  String toString() => 'AuthException: $message';
}

class ValidationException extends ApiException {
  ValidationException({required super.message, super.data}) : super(statusCode: 400);
}

class ForbiddenException extends ApiException {
  ForbiddenException({required super.message, super.data}) : super(statusCode: 403);
}

class NotFoundException extends ApiException {
  NotFoundException({required super.message, super.data}) : super(statusCode: 404);
}

class ConflictException extends ApiException {
  ConflictException({required super.message, super.data}) : super(statusCode: 409);
}

class ServerException extends ApiException {
  ServerException({required super.message, super.data, int? statusCode}) : super(statusCode: statusCode ?? 500);
}
