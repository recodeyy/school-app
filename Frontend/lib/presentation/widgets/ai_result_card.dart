import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AiResultCard extends StatelessWidget {
  final String title;
  final dynamic content;
  final VoidCallback? onRegenerate;

  const AiResultCard({
    super.key,
    required this.title,
    required this.content,
    this.onRegenerate,
  });

  @override
  Widget build(BuildContext context) {
    String displayContent = _formatContent(content);

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blueAccent),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.copy, size: 20, color: Colors.grey),
                  tooltip: 'Copy to clipboard',
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: displayContent));
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Copied to clipboard')));
                  },
                ),
              ],
            ),
            const Divider(),
            const SizedBox(height: 8),
            SelectableText(
              displayContent,
              style: const TextStyle(fontSize: 15, height: 1.5),
            ),
            if (onRegenerate != null) ...[
              const SizedBox(height: 16),
              Align(
                alignment: Alignment.centerRight,
                child: OutlinedButton.icon(
                  onPressed: onRegenerate,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Regenerate'),
                ),
              ),
            ]
          ],
        ),
      ),
    );
  }

  String _formatContent(dynamic content) {
    if (content == null) return 'No result generated.';
    if (content is String) return content;
    if (content is Map) {
      // Basic formatting for maps (like lesson plans/quizzes)
      final buffer = StringBuffer();
      content.forEach((key, value) {
        if (value is List) {
          buffer.writeln('**${_capitalize(key)}**');
          for (var item in value) {
            if (item is Map) {
              item.forEach((k, v) => buffer.writeln('- ${_capitalize(k)}: $v'));
            } else {
              buffer.writeln('- $item');
            }
          }
        } else if (value is Map) {
          buffer.writeln('**${_capitalize(key)}**');
          value.forEach((k, v) => buffer.writeln('- ${_capitalize(k)}: $v'));
        } else {
          buffer.writeln('**${_capitalize(key)}**: $value');
        }
        buffer.writeln();
      });
      return buffer.toString().replaceAll('**', ''); // remove bold markdown markers if SelectableText doesn't support markdown
    }
    return content.toString();
  }

  String _capitalize(String s) => s.isNotEmpty ? '${s[0].toUpperCase()}${s.substring(1)}' : s;
}
