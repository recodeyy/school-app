class TimetableEntry {
  final String id;
  final String classId;
  final String subjectId;
  final String teacherId;
  final String periodId;
  final String dayOfWeek;
  final String? subjectName;
  final String? teacherName;
  final String? periodName;
  final String? startTime;
  final String? endTime;

  TimetableEntry({
    required this.id,
    required this.classId,
    required this.subjectId,
    required this.teacherId,
    required this.periodId,
    required this.dayOfWeek,
    this.subjectName,
    this.teacherName,
    this.periodName,
    this.startTime,
    this.endTime,
  });

  factory TimetableEntry.fromJson(Map<String, dynamic> json) {
    return TimetableEntry(
      id: json['id'] ?? '',
      classId: json['classId'] ?? '',
      subjectId: json['subjectId'] ?? '',
      teacherId: json['teacherId'] ?? '',
      periodId: json['periodId'] ?? '',
      dayOfWeek: json['dayOfWeek'] ?? '',
      subjectName: json['subject']?['name'],
      teacherName: json['teacher']?['name'],
      periodName: json['period']?['name'],
      startTime: json['period']?['startTime'],
      endTime: json['period']?['endTime'],
    );
  }
}
