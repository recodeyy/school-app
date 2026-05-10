import '../../core/constants/api_constants.dart';
import '../models/notification_model.dart';
import 'api_service.dart';

class NotificationService {
  final ApiService _apiService;

  NotificationService(this._apiService);

  Future<List<AppNotification>> getNotifications({bool? isRead}) async {
    final queryParams = <String, String>{};
    if (isRead != null) queryParams['isRead'] = isRead.toString();

    final response = await _apiService.get(
      ApiConstants.notifications,
      queryParams: queryParams,
    );
    final List<dynamic> data = response['data'] ?? [];
    return data.map((json) => AppNotification.fromJson(json)).toList();
  }

  Future<int> getUnreadCount() async {
    final response = await _apiService.get('${ApiConstants.notifications}/unread/count');
    return response['count'] ?? 0;
  }

  Future<void> markAsRead(String id) async {
    await _apiService.patch('${ApiConstants.notifications}/$id/read');
  }

  Future<void> markAllAsRead() async {
    await _apiService.patch('${ApiConstants.notifications}/read-all');
  }
}
