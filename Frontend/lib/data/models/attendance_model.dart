class AttendanceSession {
  final String id;
  final String classId;
  final String? subjectId;
  final String? teacherId;
  final DateTime date;
  final String startTime;
  final DateTime createdAt;
  final List<AttendanceRecord> records;
  final String? subjectName;
  final String? className;
  final String? teacherName;

  AttendanceSession({
    required this.id,
    required this.classId,
    this.subjectId,
    this.teacherId,
    required this.date,
    required this.startTime,
    required this.createdAt,
    required this.records,
    this.subjectName,
    this.className,
    this.teacherName,
  });

  factory AttendanceSession.fromJson(Map<String, dynamic> json) {
    return AttendanceSession(
      id: json['id'] ?? '',
      classId: json['classId'] ?? '',
      subjectId: json['subjectId'],
      teacherId: json['teacherId'],
      date: json['date'] != null ? DateTime.parse(json['date']) : DateTime.now(),
      startTime: json['startTime'] ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      records: json['records'] != null
          ? (json['records'] as List)
              .map((r) => AttendanceRecord.fromJson(r))
              .toList()
          : [],
      subjectName: json['subject']?['name'],
      className: json['schoolClass']?['name'],
      teacherName: json['teacher']?['name'],
    );
  }
}

class AttendanceRecord {
  final String id;
  final String sessionId;
  final String studentId;
  final String status;
  final DateTime? markedAt;
  final String? note;
  final String? studentName;

  AttendanceRecord({
    required this.id,
    required this.sessionId,
    required this.studentId,
    required this.status,
    this.markedAt,
    this.note,
    this.studentName,
  });

  factory AttendanceRecord.fromJson(Map<String, dynamic> json) {
    return AttendanceRecord(
      id: json['id'] ?? '',
      sessionId: json['sessionId'] ?? '',
      studentId: json['studentId'] ?? '',
      status: json['status'] ?? 'ABSENT',
      markedAt: json['markedAt'] != null
          ? DateTime.parse(json['markedAt'])
          : null,
      note: json['note'],
      studentName: json['student']?['name'],
    );
  }
}
