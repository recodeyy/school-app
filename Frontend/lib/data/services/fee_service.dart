import '../../core/constants/api_constants.dart';
import '../../core/utils/date_helper.dart';
import '../models/fee_model.dart';
import 'api_service.dart';

class FeeService {
  final ApiService _apiService;

  FeeService(this._apiService);

  Future<Fee> createFee({
    required String studentId,
    required String title,
    String? description,
    required String amount,
    required DateTime dueDate,
  }) async {
    final response = await _apiService.post(
      ApiConstants.fees,
      body: {
        'studentId': studentId,
        'title': title,
        'description': description,
        'amount': amount,
        'dueDate': DateHelper.formatDateForApi(dueDate),
      },
    );
    return Fee.fromJson(response);
  }

  Future<List<Fee>> getFees({String? studentId, String? status}) async {
    final queryParams = <String, String>{};
    if (studentId != null) queryParams['studentId'] = studentId;
    if (status != null) queryParams['status'] = status;

    final response = await _apiService.get(
      ApiConstants.fees,
      queryParams: queryParams,
    );
    final List<dynamic> data = response['data'] ?? [];
    return data.map((json) => Fee.fromJson(json)).toList();
  }

  Future<Fee> getFeeById(String id) async {
    final response = await _apiService.get('${ApiConstants.fees}/$id');
    return Fee.fromJson(response);
  }

  Future<Payment> recordPayment({
    required String feeId,
    required String amount,
    required String paymentMethod,
    String? transactionId,
  }) async {
    final response = await _apiService.post(
      '${ApiConstants.fees}/$feeId/payments',
      body: {
        'amount': amount,
        'paymentMethod': paymentMethod,
        'transactionId': transactionId,
      },
    );
    return Payment.fromJson(response);
  }

  Future<List<Payment>> getFeePayments(String feeId) async {
    final response = await _apiService.get('${ApiConstants.fees}/$feeId/payments');
    final List<dynamic> data = response['data'] ?? [];
    return data.map((json) => Payment.fromJson(json)).toList();
  }
}
