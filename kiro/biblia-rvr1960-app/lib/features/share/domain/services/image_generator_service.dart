import 'dart:typed_data';

import '../../../../core/error/app_error.dart';
import '../../../settings/domain/entities/theme_settings.dart';

/// Background style options for generated verse images.
enum ImageStyle {
  /// Solid surface color background.
  minimalist,

  /// Linear gradient using primary/tertiary colors.
  gradient,

  /// Paper texture overlay with warm tones.
  textured,
}

/// Abstract interface for generating shareable verse images.
///
/// Implementations render verse text and reference onto a styled
/// 1080×1080 PNG image suitable for social media sharing.
abstract class ImageGeneratorService {
  /// Generates a PNG image containing the [verseText] and [reference]
  /// rendered with the specified [style] and [typeface].
  ///
  /// Returns [Result.success] with PNG bytes on success, or
  /// [Result.failure] with an [AppError] if rendering fails.
  ///
  /// The generated image is 1080×1080 pixels and includes:
  /// - Background based on [style]
  /// - Verse text centered with line wrapping
  /// - Verse reference below the text
  /// - "RVR1960" watermark at bottom-right, 30% opacity
  ///
  /// If [verseText] exceeds 300 characters, the font size is reduced
  /// proportionally to fit within the image boundaries.
  Future<Result<Uint8List>> generateImage({
    required String verseText,
    required String reference,
    required ImageStyle style,
    required AppTypeface typeface,
  });
}
