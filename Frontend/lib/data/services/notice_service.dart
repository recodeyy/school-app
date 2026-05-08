import '../../core/constants/api_constants.dart';
import '../models/notice_model.dart';
import 'api_service.dart';

class NoticeService {
  final ApiService _apiService;

  NoticeService(this._apiService);

  Future<Notice> createNotice({
    required String title,
    required String content,
    String? priority,
    bool isPublished = true,
  }) async {
    final response = await _apiService.post(
      ApiConstants.notices,
      body: {
        'title': title,
        'content': content,
        'priority': priority,
        'isPublished': isPublished,
      },
    );
    return Notice.fromJson(response);
  }

  Future<List<Notice>> getNotices({bool? isPublished}) async {
    final queryParams = <String, String>{};
    if (isPublished != null) queryParams['isPublished'] = isPublished.toString();

    final response = await _apiService.get(
      ApiConstants.notices,
      queryParams: queryParams,
    );
    final List<dynamic> data = response is List ? response : response['data'] ?? [];
    return data.map((json) => Notice.fromJson(json)).toList();
  }

  Future<Notice> getNoticeById(String id) async {
    final response = await _apiService.get('${ApiConstants.notices}/$id');
    return Notice.fromJson(response);
  }

  Future<void> deleteNotice(String id) async {
    await _apiService.delete('${ApiConstants.notices}/$id');
  }
}
