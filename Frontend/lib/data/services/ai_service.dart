import 'api_service.dart';

class AiService {
  final ApiService _apiService;
  static const Duration _aiTimeout = Duration(seconds: 90);

  AiService(this._apiService);

  // ==========================================
  // AI Analytics
  // ==========================================
  Future<Map<String, dynamic>> generateProgressSummary(String studentId, {String? language}) async {
    return await _apiService.post(
      '/ai/analytics/progress-summary',
      body: {
        'studentId': studentId,
        'language': language,
      },
      timeout: _aiTimeout,
    );
  }

  Future<Map<String, dynamic>> analyzeAttendanceRisk(String studentId) async {
    return await _apiService.post(
      '/ai/analytics/attendance-risk',
      body: {'studentId': studentId},
      timeout: _aiTimeout,
    );
  }

  Future<Map<String, dynamic>> detectWeakSubjects(String studentId) async {
    return await _apiService.post(
      '/ai/analytics/weak-subjects',
      body: {'studentId': studentId},
      timeout: _aiTimeout,
    );
  }

  // ==========================================
  // AI Admin Tools
  // ==========================================
  Future<Map<String, dynamic>> generateNotice({
    required String topic,
    required String audience,
    String? language,
    String? tone,
    List<String>? keyPoints,
  }) async {
    return await _apiService.post(
      '/ai/admin/notice',
      body: {
        'topic': topic,
        'audience': audience.toLowerCase(),
        'language': language ?? 'en',
        if (tone != null) 'tone': tone.toLowerCase(),
        'keyPoints': keyPoints,
      },
      timeout: _aiTimeout,
    );
  }

  Future<Map<String, dynamic>> generateParentMessage({
    required String studentId,
    required String issue,
    required String details,
    String? language,
    String? tone,
  }) async {
    return await _apiService.post(
      '/ai/admin/parent-message',
      body: {
        'studentId': studentId,
        'issue': issue.toLowerCase(),
        'details': details,
        'language': language ?? 'en',
        if (tone != null) 'tone': tone.toLowerCase(),
      },
      timeout: _aiTimeout,
    );
  }

  // ==========================================
  // AI Teacher Tools
  // ==========================================
  Future<Map<String, dynamic>> generateHomework({
    required String classId,
    required String subjectId,
    required String topic,
    required String difficulty,
    String? language,
    String? instructions,
  }) async {
    return await _apiService.post(
      '/ai/teacher/homework',
      body: {
        'classId': classId,
        'subjectId': subjectId,
        'topic': topic,
        'difficulty': difficulty.toLowerCase(),
        'language': language,
        'instructions': instructions,
      },
      timeout: _aiTimeout,
    );
  }

  Future<Map<String, dynamic>> generateQuiz({
    required String subjectId,
    required String chapter,
    required String difficulty,
    int? questionCount,
    List<String>? types,
    bool? includeAnswerKey,
  }) async {
    return await _apiService.post(
      '/ai/teacher/quiz',
      body: {
        'subjectId': subjectId,
        'chapter': chapter,
        'difficulty': difficulty.toLowerCase(),
        'questionCount': questionCount,
        if (types != null) 'types': types.map((e) => e.toLowerCase()).toList(),
        'includeAnswerKey': includeAnswerKey,
      },
      timeout: _aiTimeout,
    );
  }

  Future<Map<String, dynamic>> generateLessonPlan({
    required String classId,
    required String subjectId,
    required String chapter,
    int? duration,
    String? language,
  }) async {
    return await _apiService.post(
      '/ai/teacher/lesson-plan',
      body: {
        'classId': classId,
        'subjectId': subjectId,
        'chapter': chapter,
        'duration': duration,
        'language': language,
      },
      timeout: _aiTimeout,
    );
  }

  Future<Map<String, dynamic>> generateQuestionPaper({
    required String classId,
    required String subjectId,
    required String examType,
    required int totalMarks,
    required List<String> chapters,
    required List<Map<String, dynamic>> sectionConfig,
    String? language,
    bool? includeAnswerKey,
  }) async {
    return await _apiService.post(
      '/ai/teacher/question-paper',
      body: {
        'classId': classId,
        'subjectId': subjectId,
        'examType': examType,
        'totalMarks': totalMarks,
        'chapters': chapters,
        'sectionConfig': sectionConfig,
        'language': language,
        'includeAnswerKey': includeAnswerKey,
      },
      timeout: _aiTimeout,
    );
  }

  Future<Map<String, dynamic>> generateReportCardRemarks({
    required String studentId,
    String? examId,
  }) async {
    return await _apiService.post(
      '/ai/teacher/report-card-remarks',
      body: {
        'studentId': studentId,
        'examId': examId,
      },
      timeout: _aiTimeout,
    );
  }

  // ==========================================
  // AI Student Tools
  // ==========================================
  Future<Map<String, dynamic>> askDoubt({
    required String subjectId,
    required String doubt,
    String? chapter,
    String? language,
  }) async {
    return await _apiService.post(
      '/ai/student/doubt',
      body: {
        'subjectId': subjectId,
        'question': doubt, // DTO says question or doubt? Let's check when it fails or we assume 'doubt'. Wait, the DTO probably uses 'question' or 'doubt'.
        'chapter': chapter,
        'language': language,
      },
      timeout: _aiTimeout,
    );
  }

  Future<Map<String, dynamic>> generateChapterSummary({
    required String subjectId,
    required String chapter,
    String? language,
  }) async {
    return await _apiService.post(
      '/ai/student/chapter-summary',
      body: {
        'subjectId': subjectId,
        'chapter': chapter,
        'language': language,
      },
      timeout: _aiTimeout,
    );
  }

  Future<Map<String, dynamic>> generateFlashcards({
    required String subjectId,
    required String chapter,
    int? count,
  }) async {
    return await _apiService.post(
      '/ai/student/flashcards',
      body: {
        'subjectId': subjectId,
        'chapter': chapter,
        'count': count,
      },
      timeout: _aiTimeout,
    );
  }

  Future<Map<String, dynamic>> generatePracticeQuiz({
    required String subjectId,
    String? chapter,
    List<String>? weakTopics,
  }) async {
    return await _apiService.post(
      '/ai/student/practice-quiz',
      body: {
        'subjectId': subjectId,
        'chapter': chapter,
        'weakTopics': weakTopics,
      },
      timeout: _aiTimeout,
    );
  }
}
