import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../features/settings/domain/entities/theme_settings.dart';

/// Builds a [TextTheme] based on the selected [typeface] and [baseFontSize].
///
/// Typography hierarchy (relative to base font size):
/// - headlineLarge: base + 10sp — Book titles
/// - headlineMedium: base + 6sp — Chapter headers
/// - bodyLarge: base — Verse text (reader)
/// - bodySmall: base - 4sp — Verse numbers
/// - labelMedium: base - 2sp — Captions, metadata
///
/// Supported typefaces:
/// - [AppTypeface.serif]: Merriweather (classic reading)
/// - [AppTypeface.sansSerif]: Inter (modern, clean)
/// - [AppTypeface.lora]: Lora (elegant, literary)
TextTheme buildTextTheme({
  required double baseFontSize,
  required AppTypeface typeface,
}) {
  final baseStyle = _baseTextStyle(typeface);

  return TextTheme(
    headlineLarge: baseStyle.copyWith(
      fontSize: baseFontSize + 10,
      fontWeight: FontWeight.w700,
      letterSpacing: -0.5,
      height: 1.3,
    ),
    headlineMedium: baseStyle.copyWith(
      fontSize: baseFontSize + 6,
      fontWeight: FontWeight.w600,
      letterSpacing: -0.25,
      height: 1.35,
    ),
    bodyLarge: baseStyle.copyWith(
      fontSize: baseFontSize,
      fontWeight: FontWeight.w400,
      letterSpacing: 0.15,
      height: 1.6,
    ),
    bodySmall: baseStyle.copyWith(
      fontSize: baseFontSize - 4,
      fontWeight: FontWeight.w400,
      letterSpacing: 0.4,
      height: 1.4,
    ),
    labelMedium: baseStyle.copyWith(
      fontSize: baseFontSize - 2,
      fontWeight: FontWeight.w500,
      letterSpacing: 0.5,
      height: 1.4,
    ),
  );
}

/// Returns the base [TextStyle] for the given [typeface] using Google Fonts.
TextStyle _baseTextStyle(AppTypeface typeface) {
  switch (typeface) {
    case AppTypeface.serif:
      return GoogleFonts.merriweather();
    case AppTypeface.sansSerif:
      return GoogleFonts.inter();
    case AppTypeface.lora:
      return GoogleFonts.lora();
  }
}
