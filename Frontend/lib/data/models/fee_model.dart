class Fee {
  final String id;
  final String studentId;
  final String title;
  final String? description;
  final String amount;
  final DateTime dueDate;
  final String status;
  final String paidAmount;
  final DateTime createdAt;
  final String? studentName;

  Fee({
    required this.id,
    required this.studentId,
    required this.title,
    this.description,
    required this.amount,
    required this.dueDate,
    required this.status,
    required this.paidAmount,
    required this.createdAt,
    this.studentName,
  });

  factory Fee.fromJson(Map<String, dynamic> json) {
    return Fee(
      id: json['id'] ?? '',
      studentId: json['studentId'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      amount: json['amount'] ?? '0',
      dueDate: json['dueDate'] != null
          ? DateTime.parse(json['dueDate'])
          : DateTime.now(),
      status: json['status'] ?? 'PENDING',
      paidAmount: json['paidAmount'] ?? '0',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      studentName: json['student']?['name'],
    );
  }
}

class Payment {
  final String id;
  final String feeId;
  final String amount;
  final String paymentMethod;
  final String? transactionId;
  final String recordedById;
  final DateTime paidAt;
  final DateTime createdAt;

  Payment({
    required this.id,
    required this.feeId,
    required this.amount,
    required this.paymentMethod,
    this.transactionId,
    required this.recordedById,
    required this.paidAt,
    required this.createdAt,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'] ?? '',
      feeId: json['feeId'] ?? '',
      amount: json['amount'] ?? '0',
      paymentMethod: json['paymentMethod'] ?? 'CASH',
      transactionId: json['transactionId'],
      recordedById: json['recordedById'] ?? '',
      paidAt: json['paidAt'] != null
          ? DateTime.parse(json['paidAt'])
          : DateTime.now(),
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }
}
