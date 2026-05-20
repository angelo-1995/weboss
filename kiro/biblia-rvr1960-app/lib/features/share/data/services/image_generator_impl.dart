import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';

import '../../../../core/error/app_error.dart';
import '../../../../core/theme/color_schemes.dart';
import '../../../settings/domain/entities/theme_settings.dart';
import '../../domain/services/image_generator_service.dart';

/// Concrete implementation of [ImageGeneratorService] using `dart:ui`.
///
/// Renders verse text onto a 1080×1080 offscreen canvas and encodes
/// the result as PNG bytes. Targets < 2 seconds render time.
class ImageGeneratorImpl implements ImageGeneratorService {
  /// Image dimensions in pixels.
  static const int _imageSize = 1080;

  /// Base font size for verse text (in logical pixels on the canvas).
  static const double _baseFontSize = 48.0;

  /// Font size for the verse reference line.
  static const double _referenceFontSize = 32.0;

  /// Font size for the watermark text.
  static const double _watermarkFontSize = 24.0;

  /// Character threshold above which font size is reduced.
  static const int _longTextThreshold = 300;

  /// Minimum font size when reducing for long text.
  static const double _minFontSize = 24.0;

  /// Padding from image edges.
  static const double _padding = 80.0;

  @override
  Future<Result<Uint8List>> generateImage({
    required String verseText,
    required String reference,
    required ImageStyle style,
    required AppTypeface typeface,
  }) async {
    try {
      final recorder = ui.PictureRecorder();
      final canvas = Canvas(recorder, Rect.fromLTWH(0, 0, _imageSize.toDouble(), _imageSize.toDouble()));

      // 1. Draw background
      _drawBackground(canvas, style);

      // 2. Calculate font size (reduce for long text)
      final fontSize = _calculateFontSize(verseText.length);

      // 3. Draw verse text centered with line wrapping
      final textBottom = _drawVerseText(
        canvas,
        verseText,
        fontSize,
        typeface,
        style,
      );

      // 4. Draw verse reference below text
      _drawReference(canvas, reference, textBottom, typeface, style);

      // 5. Draw "RVR1960" watermark at bottom-right, 30% opacity
      _drawWatermark(canvas, style);

      // 6. Convert to PNG
      final picture = recorder.endRecording();
      final image = await picture.toImage(_imageSize, _imageSize);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);

      if (byteData == null) {
        return Result.failure(
          AppError.validation('Failed to encode image to PNG bytes'),
        );
      }

      return Result.success(byteData.buffer.asUint8List());
    } catch (e) {
      return Result.failure(
        AppError.validation('Image generation failed: ${e.toString()}'),
      );
    }
  }

  /// Draws the background based on the selected [style].
  void _drawBackground(Canvas canvas, ImageStyle style) {
    final rect = Rect.fromLTWH(0, 0, _imageSize.toDouble(), _imageSize.toDouble());

    switch (style) {
      case ImageStyle.minimalist:
        // Solid surface color (warm white)
        final paint = Paint()..color = AppColorSchemes.lightScheme.surface;
        canvas.drawRect(rect, paint);

      case ImageStyle.gradient:
        // Linear gradient from primary to tertiary
        final paint = Paint()
          ..shader = const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF3D5A80), // primary
              Color(0xFF4A6741), // tertiary
            ],
          ).createShader(rect);
        canvas.drawRect(rect, paint);

      case ImageStyle.textured:
        // Base warm tone
        final basePaint = Paint()..color = const Color(0xFFF5EDE0);
        canvas.drawRect(rect, basePaint);

        // Paper texture overlay — subtle noise pattern using lines
        final texturePaint = Paint()
          ..color = const Color(0x15000000) // very subtle
          ..strokeWidth = 0.5
          ..style = PaintingStyle.stroke;

        // Horizontal texture lines for paper effect
        for (double y = 0; y < _imageSize; y += 4) {
          canvas.drawLine(
            Offset(0, y),
            Offset(_imageSize.toDouble(), y),
            texturePaint,
          );
        }

        // Subtle vertical grain
        final grainPaint = Paint()
          ..color = const Color(0x08000000)
          ..strokeWidth = 0.3
          ..style = PaintingStyle.stroke;

        for (double x = 0; x < _imageSize; x += 6) {
          canvas.drawLine(
            Offset(x, 0),
            Offset(x, _imageSize.toDouble()),
            grainPaint,
          );
        }
    }
  }

  /// Calculates the appropriate font size based on text length.
  ///
  /// For text > 300 characters, reduces proportionally down to [_minFontSize].
  double _calculateFontSize(int textLength) {
    if (textLength <= _longTextThreshold) {
      return _baseFontSize;
    }

    // Proportional reduction: scale down as text gets longer
    // At 300 chars → base size, at 600+ chars → min size
    final ratio = _longTextThreshold / textLength;
    final reduced = _baseFontSize * ratio;
    return reduced.clamp(_minFontSize, _baseFontSize);
  }

  /// Draws the verse text centered on the canvas with line wrapping.
  ///
  /// Returns the Y coordinate of the bottom of the text block.
  double _drawVerseText(
    Canvas canvas,
    String text,
    double fontSize,
    AppTypeface typeface,
    ImageStyle style,
  ) {
    final textColor = _getTextColor(style);
    final fontFamily = _getFontFamily(typeface);

    final paragraphStyle = ui.ParagraphStyle(
      textAlign: TextAlign.center,
      fontSize: fontSize,
      fontFamily: fontFamily,
      height: 1.5,
      maxLines: null,
    );

    final textStyle = ui.TextStyle(
      color: textColor,
      fontSize: fontSize,
      fontFamily: fontFamily,
      height: 1.5,
    );

    final builder = ui.ParagraphBuilder(paragraphStyle)
      ..pushStyle(textStyle)
      ..addText('"$text"');

    final maxWidth = _imageSize.toDouble() - (_padding * 2);
    final paragraph = builder.build()
      ..layout(ui.ParagraphConstraints(width: maxWidth));

    // Center vertically (accounting for reference below)
    final totalTextHeight = paragraph.height;
    final availableHeight = _imageSize.toDouble() - (_padding * 2) - _referenceFontSize - 40;
    final yOffset = _padding + ((availableHeight - totalTextHeight) / 2).clamp(0, availableHeight);

    canvas.drawParagraph(paragraph, Offset(_padding, yOffset));

    return yOffset + paragraph.height;
  }

  /// Draws the verse reference below the verse text.
  void _drawReference(
    Canvas canvas,
    String reference,
    double yPosition,
    AppTypeface typeface,
    ImageStyle style,
  ) {
    final textColor = _getTextColor(style).withOpacity(0.7);
    final fontFamily = _getFontFamily(typeface);

    final paragraphStyle = ui.ParagraphStyle(
      textAlign: TextAlign.center,
      fontSize: _referenceFontSize,
      fontFamily: fontFamily,
    );

    final textStyle = ui.TextStyle(
      color: textColor,
      fontSize: _referenceFontSize,
      fontFamily: fontFamily,
      fontWeight: FontWeight.w600,
    );

    final builder = ui.ParagraphBuilder(paragraphStyle)
      ..pushStyle(textStyle)
      ..addText('— $reference');

    final maxWidth = _imageSize.toDouble() - (_padding * 2);
    final paragraph = builder.build()
      ..layout(ui.ParagraphConstraints(width: maxWidth));

    // Position reference 20px below the verse text
    final y = yPosition + 20;
    canvas.drawParagraph(paragraph, Offset(_padding, y));
  }

  /// Draws the "RVR1960" watermark at the bottom-right corner at 30% opacity.
  void _drawWatermark(Canvas canvas, ImageStyle style) {
    final baseColor = _getTextColor(style);
    final watermarkColor = baseColor.withOpacity(0.3);

    final paragraphStyle = ui.ParagraphStyle(
      textAlign: TextAlign.right,
      fontSize: _watermarkFontSize,
    );

    final textStyle = ui.TextStyle(
      color: watermarkColor,
      fontSize: _watermarkFontSize,
      fontWeight: FontWeight.w500,
      letterSpacing: 1.5,
    );

    final builder = ui.ParagraphBuilder(paragraphStyle)
      ..pushStyle(textStyle)
      ..addText('RVR1960');

    final maxWidth = _imageSize.toDouble() - (_padding * 2);
    final paragraph = builder.build()
      ..layout(ui.ParagraphConstraints(width: maxWidth));

    // Position at bottom-right with padding
    final x = _padding;
    final y = _imageSize.toDouble() - _padding - paragraph.height;
    canvas.drawParagraph(paragraph, Offset(x, y));
  }

  /// Returns the appropriate text color based on the background style.
  Color _getTextColor(ImageStyle style) {
    switch (style) {
      case ImageStyle.minimalist:
        return AppColorSchemes.lightScheme.onSurface;
      case ImageStyle.gradient:
        // White text on dark gradient background
        return const Color(0xFFFFFFFF);
      case ImageStyle.textured:
        return const Color(0xFF2C2C2C);
    }
  }

  /// Maps [AppTypeface] to a Google Fonts family name string.
  String _getFontFamily(AppTypeface typeface) {
    switch (typeface) {
      case AppTypeface.serif:
        return 'Merriweather';
      case AppTypeface.sansSerif:
        return 'Inter';
      case AppTypeface.lora:
        return 'Lora';
    }
  }
}
