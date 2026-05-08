class Homework {
  final String id;
  final String title;
  final String? description;
  final String classId;
  final String? subjectId;
  final String createdById;
  final DateTime dueDate;
  final List<String>? attachments;
  final bool isPublished;
  final DateTime createdAt;
  final String? subjectName;
  final String? className;
  final String? createdByName;

  Homework({
    required this.id,
    required this.title,
    this.description,
    required this.classId,
    this.subjectId,
    required this.createdById,
    required this.dueDate,
    this.attachments,
    required this.isPublished,
    required this.createdAt,
    this.subjectName,
    this.className,
    this.createdByName,
  });

  factory Homework.fromJson(Map<String, dynamic> json) {
    return Homework(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      classId: json['classId'] ?? '',
      subjectId: json['subjectId'],
      createdById: json['createdById'] ?? '',
      dueDate: json['dueDate'] != null
          ? DateTime.parse(json['dueDate'])
          : DateTime.now(),
      attachments: json['attachments'] != null
          ? List<String>.from(json['attachments'])
          : null,
      isPublished: json['isPublished'] ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      subjectName: json['subject']?['name'],
      className: json['schoolClass']?['name'],
      createdByName: json['createdBy']?['name'],
    );
  }
}

class HomeworkSubmission {
  final String id;
  final String homeworkId;
  final String studentId;
  final String status;
  final String? content;
  final List<String>? attachments;
  final String? grade;
  final String? feedback;
  final DateTime? submittedAt;
  final DateTime? gradedAt;
  final DateTime createdAt;
  final String? studentName;

  HomeworkSubmission({
    required this.id,
    required this.homeworkId,
    required this.studentId,
    required this.status,
    this.content,
    this.attachments,
    this.grade,
    this.feedback,
    this.submittedAt,
    this.gradedAt,
    required this.createdAt,
    this.studentName,
  });

  factory HomeworkSubmission.fromJson(Map<String, dynamic> json) {
    return HomeworkSubmission(
      id: json['id'] ?? '',
      homeworkId: json['homeworkId'] ?? '',
      studentId: json['studentId'] ?? '',
      status: json['status'] ?? 'PENDING',
      content: json['content'],
      attachments: json['attachments'] != null
          ? List<String>.from(json['attachments'])
          : null,
      grade: json['grade'],
      feedback: json['feedback'],
      submittedAt: json['submittedAt'] != null
          ? DateTime.parse(json['submittedAt'])
          : null,
      gradedAt:
          json['gradedAt'] != null ? DateTime.parse(json['gradedAt']) : null,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      studentName: json['student']?['name'],
    );
  }
}
