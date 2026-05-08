import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_theme.dart';
import '../../../../core/providers/providers.dart';
import '../../../../data/models/fee_model.dart';

class FeeManagementScreen extends ConsumerStatefulWidget {
  const FeeManagementScreen({super.key});

  @override
  ConsumerState<FeeManagementScreen> createState() => _FeeManagementScreenState();
}

class _FeeManagementScreenState extends ConsumerState<FeeManagementScreen> {
  List<Fee> _fees = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchFees();
  }

  Future<void> _fetchFees() async {
    setState(() => _isLoading = true);
    try {
      final fees = await ref.read(feeServiceProvider).getFees();
      setState(() {
        _fees = fees;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _showAddFeeDialog() {
    final titleController = TextEditingController();
    final amountController = TextEditingController();
    final studentIdController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create New Invoice'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: studentIdController, decoration: const InputDecoration(labelText: 'Student ID')),
            const SizedBox(height: 16),
            TextField(controller: titleController, decoration: const InputDecoration(labelText: 'Title (e.g. Tuition Fee)')),
            const SizedBox(height: 16),
            TextField(controller: amountController, decoration: const InputDecoration(labelText: 'Amount'), keyboardType: TextInputType.number),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (titleController.text.isNotEmpty) {
                await ref.read(feeServiceProvider).createFee(
                  studentId: studentIdController.text.trim(),
                  title: titleController.text.trim(),
                  amount: amountController.text.trim(),
                  dueDate: DateTime.now().add(const Duration(days: 30)),
                );
                if (context.mounted) Navigator.pop(context);
                _fetchFees();
              }
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Fee Management')),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddFeeDialog,
        child: const Icon(Icons.add),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _fees.isEmpty
              ? const Center(child: Text('No invoices found'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _fees.length,
                  itemBuilder: (context, index) {
                    final fee = _fees[index];
                    return Card(
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppColors.accent.withValues(alpha: 0.1),
                          child: const Icon(Icons.receipt_long, color: AppColors.accent),
                        ),
                        title: Text(fee.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text('Amount: ₹${fee.amount} • Due: ${fee.dueDate.toString().split(' ')[0]}'),
                        trailing: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: fee.status == 'PAID' ? AppColors.success.withValues(alpha: 0.1) : AppColors.error.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            fee.status,
                            style: TextStyle(color: fee.status == 'PAID' ? AppColors.success : AppColors.error, fontSize: 12),
                          ),
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
