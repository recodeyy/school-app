class Exam {
  final String id;
  final String name;
  final String classId;
  final String type;
  final String totalMarks;
  final DateTime examDate;
  final bool isPublished;
  final String? className;

  Exam({
    required this.id,
    required this.name,
    required this.classId,
    required this.type,
    required this.totalMarks,
    required this.examDate,
    required this.isPublished,
    this.className,
  });

  factory Exam.fromJson(Map<String, dynamic> json) {
    return Exam(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      classId: json['classId'] ?? '',
      type: json['type'] ?? 'EXAM',
      totalMarks: json['totalMarks'] ?? '100',
      examDate: json['examDate'] != null
          ? DateTime.parse(json['examDate'])
          : DateTime.now(),
      isPublished: json['isPublished'] ?? false,
      className: json['schoolClass']?['name'],
    );
  }
}

class Mark {
  final String id;
  final String examId;
  final String studentId;
  final String subjectId;
  final String marksObtained;
  final String? feedback;
  final DateTime createdAt;
  final String? studentName;
  final String? subjectName;

  Mark({
    required this.id,
    required this.examId,
    required this.studentId,
    required this.subjectId,
    required this.marksObtained,
    this.feedback,
    required this.createdAt,
    this.studentName,
    this.subjectName,
  });

  factory Mark.fromJson(Map<String, dynamic> json) {
    return Mark(
      id: json['id'] ?? '',
      examId: json['examId'] ?? '',
      studentId: json['studentId'] ?? '',
      subjectId: json['subjectId'] ?? '',
      marksObtained: json['marksObtained'] ?? '0',
      feedback: json['feedback'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      studentName: json['student']?['name'],
      subjectName: json['subject']?['name'],
    );
  }
}

class Result {
  final String id;
  final String examId;
  final String studentId;
  final String totalMarks;
  final String obtainedMarks;
  final String percentage;
  final String grade;
  final DateTime createdAt;
  final String? examName;
  final String? studentName;

  Result({
    required this.id,
    required this.examId,
    required this.studentId,
    required this.totalMarks,
    required this.obtainedMarks,
    required this.percentage,
    required this.grade,
    required this.createdAt,
    this.examName,
    this.studentName,
  });

  factory Result.fromJson(Map<String, dynamic> json) {
    return Result(
      id: json['id'] ?? '',
      examId: json['examId'] ?? '',
      studentId: json['studentId'] ?? '',
      totalMarks: json['totalMarks'] ?? '0',
      obtainedMarks: json['obtainedMarks'] ?? '0',
      percentage: json['percentage'] ?? '0',
      grade: json['grade'] ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      examName: json['exam']?['name'],
      studentName: json['student']?['name'],
    );
  }
}
