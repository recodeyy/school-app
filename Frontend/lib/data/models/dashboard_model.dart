class AdminDashboardData {
  final int totalStudents;
  final int totalTeachers;
  final int totalParents;
  final int totalStaff;
  final int totalClasses;
  final int totalSubjects;
  final int todayAttendance;
  final int totalAttendance;
  final int pendingHomework;
  final int totalFees;
  final int collectedFees;

  AdminDashboardData({
    required this.totalStudents,
    required this.totalTeachers,
    required this.totalParents,
    required this.totalStaff,
    required this.totalClasses,
    required this.totalSubjects,
    required this.todayAttendance,
    required this.totalAttendance,
    required this.pendingHomework,
    required this.totalFees,
    required this.collectedFees,
  });

  factory AdminDashboardData.fromJson(Map<String, dynamic> json) {
    return AdminDashboardData(
      totalStudents: json['totalStudents'] ?? 0,
      totalTeachers: json['totalTeachers'] ?? 0,
      totalParents: json['totalParents'] ?? 0,
      totalStaff: json['totalStaff'] ?? 0,
      totalClasses: json['totalClasses'] ?? 0,
      totalSubjects: json['totalSubjects'] ?? 0,
      todayAttendance: json['todayAttendance'] ?? 0,
      totalAttendance: json['totalAttendance'] ?? 0,
      pendingHomework: json['pendingHomework'] ?? 0,
      totalFees: json['totalFees'] ?? 0,
      collectedFees: json['collectedFees'] ?? 0,
    );
  }
}

class StudentDashboardData {
  final String? name;
  final String? className;
  final String? rollNumber;
  final int attendancePercentage;
  final int pendingHomework;
  final int totalFees;
  final int paidFees;
  final List<Notice>? recentNotices;

  StudentDashboardData({
    this.name,
    this.className,
    this.rollNumber,
    required this.attendancePercentage,
    required this.pendingHomework,
    required this.totalFees,
    required this.paidFees,
    this.recentNotices,
  });

  factory StudentDashboardData.fromJson(Map<String, dynamic> json) {
    return StudentDashboardData(
      name: json['name'],
      className: json['className'],
      rollNumber: json['rollNumber'],
      attendancePercentage: json['attendancePercentage'] ?? 0,
      pendingHomework: json['pendingHomework'] ?? 0,
      totalFees: json['totalFees'] ?? 0,
      paidFees: json['paidFees'] ?? 0,
      recentNotices: json['recentNotices'] != null
          ? (json['recentNotices'] as List)
              .map((n) => Notice.fromJson(n))
              .toList()
          : null,
    );
  }
}

class TeacherDashboardData {
  final String? name;
  final int totalClasses;
  final int totalStudents;
  final int pendingHomework;
  final int pendingAttendance;
  final List<Notice>? recentNotices;

  TeacherDashboardData({
    this.name,
    required this.totalClasses,
    required this.totalStudents,
    required this.pendingHomework,
    required this.pendingAttendance,
    this.recentNotices,
  });

  factory TeacherDashboardData.fromJson(Map<String, dynamic> json) {
    return TeacherDashboardData(
      name: json['name'],
      totalClasses: json['totalClasses'] ?? 0,
      totalStudents: json['totalStudents'] ?? 0,
      pendingHomework: json['pendingHomework'] ?? 0,
      pendingAttendance: json['pendingAttendance'] ?? 0,
      recentNotices: json['recentNotices'] != null
          ? (json['recentNotices'] as List)
              .map((n) => Notice.fromJson(n))
              .toList()
          : null,
    );
  }
}

class Notice {
  final String id;
  final String title;
  final String content;
  final DateTime createdAt;
  final String? priority;
  final String? createdByName;

  Notice({
    required this.id,
    required this.title,
    required this.content,
    required this.createdAt,
    this.priority,
    this.createdByName,
  });

  factory Notice.fromJson(Map<String, dynamic> json) {
    return Notice(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      priority: json['priority'],
      createdByName: json['createdBy']?['name'] ?? json['createdByName'],
    );
  }
}
