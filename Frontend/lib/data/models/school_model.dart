class SchoolClass {
  final String id;
  final String name;
  final String? academicYear;
  final String? academicYearId;
  final String? classTeacherId;
  final DateTime createdAt;

  SchoolClass({
    required this.id,
    required this.name,
    this.academicYear,
    this.academicYearId,
    this.classTeacherId,
    required this.createdAt,
  });

  factory SchoolClass.fromJson(Map<String, dynamic> json) {
    return SchoolClass(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      academicYear: json['academicYear'],
      academicYearId: json['academicYearId'],
      classTeacherId: json['classTeacherId'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }
}

class Subject {
  final String id;
  final String name;
  final String code;
  final String classId;
  final String? teacherId;
  final String? teacherName;

  Subject({
    required this.id,
    required this.name,
    required this.code,
    required this.classId,
    this.teacherId,
    this.teacherName,
  });

  factory Subject.fromJson(Map<String, dynamic> json) {
    return Subject(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      code: json['code'] ?? '',
      classId: json['classId'] ?? '',
      teacherId: json['teacherId'],
      teacherName: json['teacher']?['name'],
    );
  }
}

class Section {
  final String id;
  final String name;
  final String? classId;

  Section({
    required this.id,
    required this.name,
    this.classId,
  });

  factory Section.fromJson(Map<String, dynamic> json) {
    return Section(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      classId: json['classId'],
    );
  }
}

class AcademicYear {
  final String id;
  final String name;
  final DateTime startDate;
  final DateTime endDate;
  final bool isActive;

  AcademicYear({
    required this.id,
    required this.name,
    required this.startDate,
    required this.endDate,
    required this.isActive,
  });

  factory AcademicYear.fromJson(Map<String, dynamic> json) {
    return AcademicYear(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      startDate: json['startDate'] != null
          ? DateTime.parse(json['startDate'])
          : DateTime.now(),
      endDate: json['endDate'] != null
          ? DateTime.parse(json['endDate'])
          : DateTime.now(),
      isActive: json['isActive'] ?? false,
    );
  }
}

class Holiday {
  final String id;
  final String name;
  final DateTime date;
  final String? description;

  Holiday({
    required this.id,
    required this.name,
    required this.date,
    this.description,
  });

  factory Holiday.fromJson(Map<String, dynamic> json) {
    return Holiday(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      date: json['date'] != null ? DateTime.parse(json['date']) : DateTime.now(),
      description: json['description'],
    );
  }
}

class Period {
  final String id;
  final String name;
  final String startTime;
  final String endTime;
  final int order;

  Period({
    required this.id,
    required this.name,
    required this.startTime,
    required this.endTime,
    required this.order,
  });

  factory Period.fromJson(Map<String, dynamic> json) {
    return Period(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      startTime: json['startTime'] ?? '',
      endTime: json['endTime'] ?? '',
      order: json['order'] ?? 0,
    );
  }
}
