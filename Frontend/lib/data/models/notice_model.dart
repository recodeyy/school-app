class Notice {
  final String id;
  final String title;
  final String content;
  final String? priority;
  final bool isPublished;
  final DateTime createdAt;
  final String? createdByName;

  Notice({
    required this.id,
    required this.title,
    required this.content,
    this.priority,
    required this.isPublished,
    required this.createdAt,
    this.createdByName,
  });

  factory Notice.fromJson(Map<String, dynamic> json) {
    return Notice(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      priority: json['priority'],
      isPublished: json['isPublished'] ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      createdByName: json['createdBy']?['name'],
    );
  }
}
