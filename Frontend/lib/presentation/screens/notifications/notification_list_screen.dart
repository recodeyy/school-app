import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../data/models/notification_model.dart';
import '../../../../core/constants/app_theme.dart';
import '../../../../core/providers/providers.dart';

class NotificationListScreen extends ConsumerStatefulWidget {
  const NotificationListScreen({super.key});

  @override
  ConsumerState<NotificationListScreen> createState() => _NotificationListScreenState();
}

class _NotificationListScreenState extends ConsumerState<NotificationListScreen> {
  late Future<List<AppNotification>> _notificationsFuture;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    _notificationsFuture = ref.read(notificationServiceProvider).getNotifications();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          TextButton(
            onPressed: () async {
              await ref.read(notificationServiceProvider).markAllAsRead();
              setState(() {
                _loadData();
              });
            },
            child: const Text('Mark all as read', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: FutureBuilder<List<AppNotification>>(
        future: _notificationsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          final notifications = snapshot.data!;
          if (notifications.isEmpty) {
            return const Center(child: Text('No notifications found'));
          }

          return ListView.builder(
            itemCount: notifications.length,
            itemBuilder: (context, index) {
              final notification = notifications[index];
              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: _getNotificationColor(notification.type).withValues(alpha: 0.1),
                  child: Icon(_getNotificationIcon(notification.type), color: _getNotificationColor(notification.type)),
                ),
                title: Text(
                  notification.title,
                  style: TextStyle(fontWeight: notification.isRead ? FontWeight.normal : FontWeight.bold),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(notification.message),
                    const SizedBox(height: 4),
                    Text(
                      DateFormat('MMM d, h:mm a').format(notification.createdAt),
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ],
                ),
                tileColor: notification.isRead ? null : AppColors.primary.withValues(alpha: 0.05),
                onTap: () async {
                  if (!notification.isRead) {
                    await ref.read(notificationServiceProvider).markAsRead(notification.id);
                    setState(() {
                      _loadData();
                    });
                  }
                },
              );
            },
          );
        },
      ),
    );
  }

  IconData _getNotificationIcon(String type) {
    switch (type) {
      case 'ATTENDANCE': return Icons.calendar_today;
      case 'HOMEWORK': return Icons.assignment;
      case 'EXAM': return Icons.grade;
      case 'FEE': return Icons.payment;
      case 'NOTICE': return Icons.notifications;
      default: return Icons.info_outline;
    }
  }

  Color _getNotificationColor(String type) {
    switch (type) {
      case 'ATTENDANCE': return AppColors.primary;
      case 'HOMEWORK': return AppColors.warning;
      case 'EXAM': return AppColors.accent;
      case 'FEE': return AppColors.error;
      case 'NOTICE': return AppColors.success;
      default: return AppColors.secondary;
    }
  }
}
