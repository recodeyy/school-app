class AuthTokens {
  final String accessToken;
  final String refreshToken;

  AuthTokens({
    required this.accessToken,
    required this.refreshToken,
  });

  factory AuthTokens.fromJson(Map<String, dynamic> json) {
    return AuthTokens(
      accessToken: json['accessToken'] ?? json['access_token'] ?? '',
      refreshToken: json['refreshToken'] ?? json['refresh_token'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'accessToken': accessToken,
      'refreshToken': refreshToken,
    };
  }
}

class LoginResponse {
  final AuthTokens tokens;
  final User user;

  LoginResponse({
    required this.tokens,
    required this.user,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      tokens: AuthTokens(
        accessToken: json['accessToken'] ?? json['access_token'] ?? '',
        refreshToken: json['refreshToken'] ?? json['refresh_token'] ?? '',
      ),
      user: User.fromJson(json['user'] ?? json),
    );
  }
}

class User {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String role;
  final String? avatarUrl;
  final bool isActive;
  final StudentProfile? studentProfile;
  final TeacherProfile? teacherProfile;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    required this.role,
    this.avatarUrl,
    required this.isActive,
    this.studentProfile,
    this.teacherProfile,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      role: json['role'] ?? 'STUDENT',
      avatarUrl: json['avatarUrl'],
      isActive: json['isActive'] ?? true,
      studentProfile: json['studentProfile'] != null ? StudentProfile.fromJson(json['studentProfile']) : null,
      teacherProfile: json['teacherProfile'] != null ? TeacherProfile.fromJson(json['teacherProfile']) : null,
    );
  }
}

class StudentProfile {
  final String? rollNumber;
  final String? classId;
  final String? sectionId;

  StudentProfile({this.rollNumber, this.classId, this.sectionId});

  factory StudentProfile.fromJson(Map<String, dynamic> json) {
    return StudentProfile(
      rollNumber: json['rollNumber'],
      classId: json['classId'],
      sectionId: json['sectionId'],
    );
  }
}

class TeacherProfile {
  final String? employeeId;
  final String? designation;

  TeacherProfile({this.employeeId, this.designation});

  factory TeacherProfile.fromJson(Map<String, dynamic> json) {
    return TeacherProfile(
      employeeId: json['employeeId'],
      designation: json['designation'],
    );
  }
}
