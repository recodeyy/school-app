class User {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String role;
  final String? avatarUrl;
  final bool isActive;
  final DateTime createdAt;
  final StudentProfile? studentProfile;
  final ParentProfile? parentProfile;
  final TeacherProfile? teacherProfile;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    required this.role,
    this.avatarUrl,
    required this.isActive,
    required this.createdAt,
    this.studentProfile,
    this.parentProfile,
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
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      studentProfile: json['studentProfile'] != null
          ? StudentProfile.fromJson(json['studentProfile'])
          : null,
      parentProfile: json['parentProfile'] != null
          ? ParentProfile.fromJson(json['parentProfile'])
          : null,
      teacherProfile: json['teacherProfile'] != null
          ? TeacherProfile.fromJson(json['teacherProfile'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'role': role,
      'avatarUrl': avatarUrl,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class StudentProfile {
  final String? classId;
  final String? className;
  final String? rollNumber;
  final String? admissionNumber;
  final String? dob;
  final String? guardianId;

  StudentProfile({
    this.classId,
    this.className,
    this.rollNumber,
    this.admissionNumber,
    this.dob,
    this.guardianId,
  });

  factory StudentProfile.fromJson(Map<String, dynamic> json) {
    return StudentProfile(
      classId: json['classId'],
      className: json['class']?['name'] ?? json['className'],
      rollNumber: json['rollNumber'],
      admissionNumber: json['admissionNumber'],
      dob: json['dob'],
      guardianId: json['guardianId'],
    );
  }
}

class ParentProfile {
  final String? relationship;

  ParentProfile({this.relationship});

  factory ParentProfile.fromJson(Map<String, dynamic> json) {
    return ParentProfile(
      relationship: json['relationship'],
    );
  }
}

class TeacherProfile {
  final String? employeeId;
  final List<String>? subjects;
  final String? designation;

  TeacherProfile({
    this.employeeId,
    this.subjects,
    this.designation,
  });

  factory TeacherProfile.fromJson(Map<String, dynamic> json) {
    return TeacherProfile(
      employeeId: json['employeeId'],
      subjects: json['subjects'] != null
          ? List<String>.from(json['subjects'])
          : null,
      designation: json['designation'],
    );
  }
}
