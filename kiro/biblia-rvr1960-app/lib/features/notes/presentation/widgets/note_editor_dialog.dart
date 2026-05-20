import 'package:flutter/material.dart';

import '../../../../core/constants/app_constants.dart';

/// Bottom sheet dialog for creating or editing a note.
///
/// Features:
/// - TextField with maxLength=2000 and live character counter
/// - Validation: error if empty on save attempt, warning near limit
/// - Save and Cancel buttons
/// - Pre-fills text when editing an existing note
/// - Returns the note text on save, null on cancel
///
/// Validates: Requirements 5.7, 5.8
class NoteEditorDialog extends StatefulWidget {
  /// Initial text to pre-fill when editing an existing note.
  /// Pass null or empty string for creating a new note.
  final String? initialText;

  const NoteEditorDialog({
    super.key,
    this.initialText,
  });

  @override
  State<NoteEditorDialog> createState() => _NoteEditorDialogState();
}

class _NoteEditorDialogState extends State<NoteEditorDialog> {
  late final TextEditingController _controller;
  late final FocusNode _focusNode;

  /// Whether the user has attempted to save (triggers validation display).
  bool _hasAttemptedSave = false;

  /// Current character count for the counter display.
  int _charCount = 0;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialText ?? '');
    _charCount = _controller.text.length;
    _focusNode = FocusNode();

    _controller.addListener(_onTextChanged);

    // Auto-focus the text field after the bottom sheet animation.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _controller.removeListener(_onTextChanged);
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onTextChanged() {
    setState(() {
      _charCount = _controller.text.length;
      // Clear the attempted save error once user starts typing.
      if (_hasAttemptedSave && _controller.text.isNotEmpty) {
        _hasAttemptedSave = false;
      }
    });
  }

  /// Validates and saves the note.
  void _onSave() {
    final text = _controller.text.trim();

    if (text.isEmpty) {
      setState(() {
        _hasAttemptedSave = true;
      });
      return;
    }

    if (text.length > AppConstants.maxNoteLength) {
      // Should not happen due to maxLength on TextField, but guard anyway.
      return;
    }

    Navigator.of(context).pop(text);
  }

  /// Cancels editing and returns null.
  void _onCancel() {
    Navigator.of(context).pop(null);
  }

  /// Returns the validation error message, or null if valid.
  String? get _errorText {
    if (_hasAttemptedSave && _controller.text.trim().isEmpty) {
      return 'La nota no puede estar vacía';
    }
    return null;
  }

  /// Whether the character count is near the limit (>= 90%).
  bool get _isNearLimit {
    return _charCount >= (AppConstants.maxNoteLength * 0.9).round();
  }

  /// Whether the character count has reached the limit.
  bool get _isAtLimit {
    return _charCount >= AppConstants.maxNoteLength;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isEditing = widget.initialText != null && widget.initialText!.isNotEmpty;
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 16,
        bottom: bottomInset + 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Drag handle.
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: theme.colorScheme.onSurface.withOpacity(0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Title.
          Text(
            isEditing ? 'Editar nota' : 'Nueva nota',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),

          // Text field.
          TextField(
            controller: _controller,
            focusNode: _focusNode,
            maxLength: AppConstants.maxNoteLength,
            maxLines: 6,
            minLines: 3,
            textCapitalization: TextCapitalization.sentences,
            decoration: InputDecoration(
              hintText: 'Escribe tu nota aquí...',
              errorText: _errorText,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: theme.colorScheme.outline.withOpacity(0.5),
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: theme.colorScheme.primary,
                  width: 2,
                ),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: theme.colorScheme.error,
                ),
              ),
              // Hide the default counter — we show our own.
              counterText: '',
            ),
          ),
          const SizedBox(height: 8),

          // Custom character counter with warning colors.
          _CharacterCounter(
            current: _charCount,
            max: AppConstants.maxNoteLength,
            isNearLimit: _isNearLimit,
            isAtLimit: _isAtLimit,
          ),
          const SizedBox(height: 16),

          // Action buttons.
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: _onCancel,
                child: Text(
                  'Cancelar',
                  style: TextStyle(color: theme.colorScheme.onSurface),
                ),
              ),
              const SizedBox(width: 12),
              FilledButton(
                onPressed: _onSave,
                child: Text(isEditing ? 'Guardar' : 'Crear'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Character counter widget with color-coded warnings.
class _CharacterCounter extends StatelessWidget {
  final int current;
  final int max;
  final bool isNearLimit;
  final bool isAtLimit;

  const _CharacterCounter({
    required this.current,
    required this.max,
    required this.isNearLimit,
    required this.isAtLimit,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    Color counterColor;
    if (isAtLimit) {
      counterColor = theme.colorScheme.error;
    } else if (isNearLimit) {
      counterColor = theme.colorScheme.tertiary;
    } else {
      counterColor = theme.colorScheme.onSurface.withOpacity(0.5);
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        if (isNearLimit && !isAtLimit)
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: Icon(
              Icons.warning_amber_rounded,
              size: 16,
              color: counterColor,
            ),
          ),
        if (isAtLimit)
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: Icon(
              Icons.error_outline,
              size: 16,
              color: counterColor,
            ),
          ),
        Text(
          '$current / $max',
          style: theme.textTheme.labelSmall?.copyWith(
            color: counterColor,
            fontWeight: isNearLimit ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}

/// Shows the note editor as a modal bottom sheet.
///
/// Returns the note text on save, or null if cancelled.
///
/// [initialText] — pass the existing note text when editing, or null for new notes.
Future<String?> showNoteEditor(
  BuildContext context, {
  String? initialText,
}) {
  return showModalBottomSheet<String>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
    ),
    builder: (context) => NoteEditorDialog(initialText: initialText),
  );
}
