import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/providers.dart';
import '../../../../data/models/user_model.dart';

class AiInsightsScreen extends ConsumerStatefulWidget {
  const AiInsightsScreen({super.key});

  @override
  ConsumerState<AiInsightsScreen> createState() => _AiInsightsScreenState();
}

class _AiInsightsScreenState extends ConsumerState<AiInsightsScreen> {
  User? _selectedStudent;
  List<User> _students = [];
  bool _isLoading = false;
  Map<String, dynamic>? _analysis;

  @override
  void initState() {
    super.initState();
    _fetchStudents();
  }

  Future<void> _fetchStudents() async {
    final students = await ref.read(userServiceProvider).getUsers(role: 'STUDENT');
    setState(() => _students = students);
  }

  Future<void> _generateAnalysis() async {
    if (_selectedStudent == null) return;
    setState(() => _isLoading = true);
    try {
      final summary = await ref.read(aiServiceProvider).generateProgressSummary(_selectedStudent!.id);
      final risk = await ref.read(aiServiceProvider).analyzeAttendanceRisk(_selectedStudent!.id);
      final weak = await ref.read(aiServiceProvider).detectWeakSubjects(_selectedStudent!.id);
      
      setState(() {
        _analysis = {
          'summary': summary['summary'],
          'risk': risk['analysis'],
          'weak': weak['analysis'],
        };
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('AI Analysis failed: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI Student Insights')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            DropdownButtonFormField<User>(
              initialValue: _selectedStudent,
              decoration: const InputDecoration(labelText: 'Select Student'),
              items: _students.map((s) => DropdownMenuItem(value: s, child: Text(s.name))).toList(),
              onChanged: (v) => setState(() => _selectedStudent = v),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _selectedStudent == null || _isLoading ? null : _generateAnalysis,
              icon: const Icon(Icons.auto_awesome),
              label: const Text('Generate AI Analysis'),
            ),
            const SizedBox(height: 24),
            if (_isLoading)
              const Center(child: CircularProgressIndicator())
            else if (_analysis != null)
              Expanded(
                child: ListView(
                  children: [
                    _buildInsightSection('Progress Summary', _analysis!['summary'], Icons.trending_up, Colors.blue),
                    _buildInsightSection('Attendance Risk', _analysis!['risk'], Icons.warning_amber, Colors.orange),
                    _buildInsightSection('Weak Subjects', _analysis!['weak'], Icons.psychology, Colors.purple),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildInsightSection(String title, String? content, IconData icon, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color),
                const SizedBox(width: 8),
                Text(title, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
              ],
            ),
            const SizedBox(height: 12),
            Text(content ?? 'No data available', style: const TextStyle(height: 1.5)),
          ],
        ),
      ),
    );
  }
}
