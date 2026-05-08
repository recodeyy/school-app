import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../data/models/fee_model.dart';
import '../../../../core/constants/app_theme.dart';
import '../../../../core/providers/providers.dart';

class FeeListScreen extends ConsumerStatefulWidget {
  final String? studentId;
  const FeeListScreen({super.key, this.studentId});

  @override
  ConsumerState<FeeListScreen> createState() => _FeeListScreenState();
}

class _FeeListScreenState extends ConsumerState<FeeListScreen> {
  late Future<List<Fee>> _feesFuture;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    final sId = widget.studentId ?? ref.read(authProvider).user!.id;
    _feesFuture = ref.read(feeServiceProvider).getFees(studentId: sId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Fees & Payments'),
      ),
      body: FutureBuilder<List<Fee>>(
        future: _feesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          final fees = snapshot.data!;
          if (fees.isEmpty) {
            return const Center(child: Text('No fee records found'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: fees.length,
            itemBuilder: (context, index) {
              final fee = fees[index];
              final isPaid = fee.status == 'PAID';
              final isOverdue = fee.dueDate.isBefore(DateTime.now()) && !isPaid;

              return Card(
                margin: const EdgeInsets.only(bottom: 16),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            fee.title,
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          _buildStatusBadge(fee.status, isOverdue),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildInfoColumn('Amount', '₹${fee.amount}'),
                          _buildInfoColumn('Paid', '₹${fee.paidAmount}'),
                          _buildInfoColumn('Due Date', DateFormat('MMM d, yyyy').format(fee.dueDate)),
                        ],
                      ),
                      if (!isPaid) ...[
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () {
                              // Implement payment logic
                            },
                            child: const Text('Pay Now'),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildStatusBadge(String status, bool isOverdue) {
    Color color = AppColors.success;
    if (status == 'PENDING') color = AppColors.warning;
    if (isOverdue) color = AppColors.error;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        isOverdue ? 'OVERDUE' : status,
        style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildInfoColumn(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
