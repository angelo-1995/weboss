import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

import '../../../settings/domain/entities/theme_settings.dart';
import '../../domain/services/image_generator_service.dart';
import '../providers/share_providers.dart';

/// A bottom sheet that presents 3 image style options for sharing a verse.
///
/// On style selection, generates a 1080×1080 PNG image, saves it to a
/// temporary file, and invokes the Android system share sheet.
///
/// Shows a loading indicator during generation and an error SnackBar
/// if generation fails.
class ShareStyleSheet extends ConsumerStatefulWidget {
  /// The verse text to render in the image.
  final String verseText;

  /// The verse reference (e.g., "Juan 3:16").
  final String reference;

  /// The current app typeface to apply to the generated image.
  final AppTypeface typeface;

  const ShareStyleSheet({
    super.key,
    required this.verseText,
    required this.reference,
    required this.typeface,
  });

  /// Shows the share style bottom sheet.
  ///
  /// Returns when the bottom sheet is dismissed.
  static Future<void> show(
    BuildContext context, {
    required String verseText,
    required String reference,
    required AppTypeface typeface,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => ShareStyleSheet(
        verseText: verseText,
        reference: reference,
        typeface: typeface,
      ),
    );
  }

  @override
  ConsumerState<ShareStyleSheet> createState() => _ShareStyleSheetState();
}

class _ShareStyleSheetState extends ConsumerState<ShareStyleSheet> {
  bool _isGenerating = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Drag handle
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: theme.colorScheme.onSurfaceVariant.withOpacity(0.4),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Title
            Text(
              'Compartir como imagen',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),

            // Subtitle
            Text(
              'Selecciona un estilo',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),

            // Style options
            if (_isGenerating)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 48),
                child: Center(child: CircularProgressIndicator()),
              )
            else
              Row(
                children: [
                  Expanded(
                    child: _StyleOptionCard(
                      label: 'Minimalista',
                      style: ImageStyle.minimalist,
                      onTap: () => _onStyleSelected(ImageStyle.minimalist),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StyleOptionCard(
                      label: 'Gradiente',
                      style: ImageStyle.gradient,
                      onTap: () => _onStyleSelected(ImageStyle.gradient),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StyleOptionCard(
                      label: 'Textura',
                      style: ImageStyle.textured,
                      onTap: () => _onStyleSelected(ImageStyle.textured),
                    ),
                  ),
                ],
              ),

            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  /// Handles style selection: generate image → save to temp → share.
  Future<void> _onStyleSelected(ImageStyle style) async {
    setState(() => _isGenerating = true);

    try {
      final notifier = ref.read(shareNotifierProvider.notifier);
      final params = ShareImageParams(
        verseText: widget.verseText,
        reference: widget.reference,
        style: style,
        typeface: widget.typeface,
      );

      final imageBytes = await notifier.generateImage(params);

      if (!mounted) return;

      if (imageBytes == null) {
        // Generation failed — show error snackbar
        _showErrorSnackBar();
        setState(() => _isGenerating = false);
        return;
      }

      // Save to temp directory
      final tempDir = await getTemporaryDirectory();
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final file = File('${tempDir.path}/verse_share_$timestamp.png');
      await file.writeAsBytes(imageBytes);

      if (!mounted) return;

      // Invoke system share sheet
      await Share.shareXFiles(
        [XFile(file.path)],
        text: '${widget.verseText}\n— ${widget.reference}',
      );

      if (!mounted) return;

      // Close the bottom sheet after sharing
      Navigator.of(context).pop();
    } catch (e) {
      if (!mounted) return;
      _showErrorSnackBar();
      setState(() => _isGenerating = false);
    }
  }

  /// Shows an error SnackBar indicating image generation failed.
  void _showErrorSnackBar() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('No se pudo generar la imagen. Intenta de nuevo.'),
        behavior: SnackBarBehavior.floating,
        action: SnackBarAction(
          label: 'OK',
          onPressed: () {},
        ),
      ),
    );
  }
}

/// A tappable card showing a style preview and label.
class _StyleOptionCard extends StatelessWidget {
  final String label;
  final ImageStyle style;
  final VoidCallback onTap;

  const _StyleOptionCard({
    required this.label,
    required this.style,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: theme.colorScheme.outlineVariant,
            width: 1,
          ),
        ),
        child: Column(
          children: [
            // Preview area
            Container(
              height: 80,
              decoration: BoxDecoration(
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(11),
                ),
                gradient: _getPreviewDecoration(style),
                color: _getPreviewColor(style),
              ),
              child: Center(
                child: Text(
                  'Aa',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: _getPreviewTextColor(style),
                  ),
                ),
              ),
            ),

            // Label
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Text(
                label,
                style: theme.textTheme.labelSmall?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Returns the background color for non-gradient styles.
  Color? _getPreviewColor(ImageStyle style) {
    switch (style) {
      case ImageStyle.minimalist:
        return const Color(0xFFFFFBF5);
      case ImageStyle.textured:
        return const Color(0xFFF5EDE0);
      case ImageStyle.gradient:
        return null; // Uses gradient instead
    }
  }

  /// Returns the gradient for the gradient style, null otherwise.
  LinearGradient? _getPreviewDecoration(ImageStyle style) {
    if (style == ImageStyle.gradient) {
      return const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          Color(0xFF3D5A80),
          Color(0xFF4A6741),
        ],
      );
    }
    return null;
  }

  /// Returns the text color for the preview based on style.
  Color _getPreviewTextColor(ImageStyle style) {
    switch (style) {
      case ImageStyle.minimalist:
        return const Color(0xFF1C1B1F);
      case ImageStyle.gradient:
        return const Color(0xFFFFFFFF);
      case ImageStyle.textured:
        return const Color(0xFF2C2C2C);
    }
  }
}
