enum UserRole {
  admin,
  principal,
  teacher,
  student,
  parent,
  staff,
  admissionCounselor,
  superAdmin;

  String get displayName {
    switch (this) {
      case UserRole.admin:
        return 'Admin';
      case UserRole.principal:
        return 'Principal';
      case UserRole.teacher:
        return 'Teacher';
      case UserRole.student:
        return 'Student';
      case UserRole.parent:
        return 'Parent';
      case UserRole.staff:
        return 'Staff';
      case UserRole.admissionCounselor:
        return 'Admission Counselor';
      case UserRole.superAdmin:
        return 'Super Admin';
    }
  }

  static UserRole fromString(String role) {
    final upperRole = role.toUpperCase();
    if (upperRole == 'ADMISSION_COUNSELOR') return UserRole.admissionCounselor;
    if (upperRole == 'SUPER_ADMIN') return UserRole.superAdmin;
    
    return UserRole.values.firstWhere(
      (e) => e.name.toUpperCase() == upperRole,
      orElse: () => UserRole.student,
    );
  }
}
