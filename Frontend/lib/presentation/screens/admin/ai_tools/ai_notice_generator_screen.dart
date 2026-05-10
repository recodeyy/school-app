import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/providers.dart';
import '../../../widgets/ai_result_card.dart';

class AiNoticeGeneratorScreen extends ConsumerStatefulWidget {
  const AiNoticeGeneratorScreen({super.key});

  @override
  ConsumerState<AiNoticeGeneratorScreen> createState() => _AiNoticeGeneratorScreenState();
}

class _AiNoticeGeneratorScreenState extends ConsumerState<AiNoticeGeneratorScreen> {
  final _formKey = GlobalKey<FormState>();
  
  final _topicController = TextEditingController();
  final _keyPointsController = TextEditingController();
  
  String _audience = 'all';
  String _tone = 'formal';
  String _language = 'en';
  
  bool _isLoading = false;
  Map<String, dynamic>? _result;

  Future<void> _generate() async {
    if (!_formKey.currentState!.validate()) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter a topic.')));
      return;
    }

    setState(() {
      _isLoading = true;
      _result = null;
    });

    try {
      final keyPointsList = _keyPointsController.text.isNotEmpty 
          ? _keyPointsController.text.split('\n').map((e) => e.trim()).where((e) => e.isNotEmpty).toList() 
          : null;

      final result = await ref.read(aiServiceProvider).generateNotice(
        topic: _topicController.text,
        audience: _audience,
        language: _language,
        tone: _tone,
        keyPoints: keyPointsList,
      );
      
      setState(() => _result = result);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI Notice Generator')),
      body: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 1,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    TextFormField(
                      controller: _topicController,
                      decoration: const InputDecoration(labelText: 'Notice Topic / Subject *'),
                      validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      initialValue: _audience,
                      decoration: const InputDecoration(labelText: 'Audience'),
                      items: ['all', 'parents', 'students', 'staff']
                          .map((a) => DropdownMenuItem(value: a, child: Text(a.toUpperCase())))
                          .toList(),
                      onChanged: (val) => setState(() => _audience = val!),
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      initialValue: _tone,
                      decoration: const InputDecoration(labelText: 'Tone'),
                      items: ['formal', 'friendly']
                          .map((t) => DropdownMenuItem(value: t, child: Text(t.toUpperCase())))
                          .toList(),
                      onChanged: (val) => setState(() => _tone = val!),
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      initialValue: _language,
                      decoration: const InputDecoration(labelText: 'Language'),
                      items: [
                        const DropdownMenuItem(value: 'en', child: Text('English')),
                        const DropdownMenuItem(value: 'hi', child: Text('Hindi')),
                        const DropdownMenuItem(value: 'mr', child: Text('Marathi')),
                      ],
                      onChanged: (val) => setState(() => _language = val!),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _keyPointsController,
                      decoration: const InputDecoration(
                        labelText: 'Key Points (Optional, one per line)',
                        alignLabelWithHint: true,
                      ),
                      maxLines: 4,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: _isLoading ? null : _generate,
                      icon: _isLoading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.campaign),
                      label: Text(_isLoading ? 'Generating (up to 90s)...' : 'Generate Notice'),
                      style: ElevatedButton.styleFrom(padding: const EdgeInsets.all(16)),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const VerticalDivider(width: 1),
          Expanded(
            flex: 2,
            child: Container(
              color: Colors.grey[50],
              padding: const EdgeInsets.all(16),
              child: _isLoading
                  ? const Center(child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(),
                        SizedBox(height: 16),
                        Text('AI is writing your notice...'),
                      ],
                    ))
                  : _result != null
                      ? AiResultCard(
                          title: 'Notice Draft',
                          content: _result,
                        )
                      : const Center(child: Text('Fill out the form and click Generate.')),
            ),
          ),
        ],
      ),
    );
  }
}