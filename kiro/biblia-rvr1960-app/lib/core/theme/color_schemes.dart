import 'package:flutter/material.dart';

/// Material 3 color scheme tokens for the Biblia RVR1960 app.
///
/// Light theme uses warm, inviting colors suitable for extended reading:
/// - Deep indigo/blue primary for trust and spirituality
/// - Warm gold secondary for highlights and accents
/// - Soft teal tertiary for complementary elements
///
/// Dark theme uses muted, comfortable tones for nighttime reading.
class AppColorSchemes {
  AppColorSchemes._();

  /// Light color scheme with warm, inviting tones for Bible reading.
  static const lightScheme = ColorScheme(
    brightness: Brightness.light,
    primary: Color(0xFF3D5A80), // Deep blue — trust, spirituality
    onPrimary: Color(0xFFFFFFFF),
    primaryContainer: Color(0xFFD6E3F8),
    onPrimaryContainer: Color(0xFF0D1B2A),
    secondary: Color(0xFF8B6914), // Warm gold — highlights, accents
    onSecondary: Color(0xFFFFFFFF),
    secondaryContainer: Color(0xFFFFF0C7),
    onSecondaryContainer: Color(0xFF2B1F00),
    tertiary: Color(0xFF4A6741), // Forest green — growth, life
    onTertiary: Color(0xFFFFFFFF),
    tertiaryContainer: Color(0xFFCCEBC3),
    onTertiaryContainer: Color(0xFF0B2007),
    error: Color(0xFFBA1A1A),
    onError: Color(0xFFFFFFFF),
    errorContainer: Color(0xFFFFDAD6),
    onErrorContainer: Color(0xFF410002),
    surface: Color(0xFFFFFBF5), // Warm white — easy on the eyes
    onSurface: Color(0xFF1C1B1F),
    surfaceContainerHighest: Color(0xFFE8E0D5),
    onSurfaceVariant: Color(0xFF49454F),
    outline: Color(0xFF7A757F),
    outlineVariant: Color(0xFFCAC4D0),
    shadow: Color(0xFF000000),
    scrim: Color(0xFF000000),
    inverseSurface: Color(0xFF313033),
    onInverseSurface: Color(0xFFF4EFF4),
    inversePrimary: Color(0xFFA8C8E8),
  );

  /// Dark color scheme with muted tones for comfortable nighttime reading.
  static const darkScheme = ColorScheme(
    brightness: Brightness.dark,
    primary: Color(0xFFA8C8E8), // Soft blue
    onPrimary: Color(0xFF0D1B2A),
    primaryContainer: Color(0xFF2A4365),
    onPrimaryContainer: Color(0xFFD6E3F8),
    secondary: Color(0xFFE8C547), // Warm gold
    onSecondary: Color(0xFF3D2E00),
    secondaryContainer: Color(0xFF5C4500),
    onSecondaryContainer: Color(0xFFFFF0C7),
    tertiary: Color(0xFFA8D5A0), // Soft green
    onTertiary: Color(0xFF1B3518),
    tertiaryContainer: Color(0xFF324F2B),
    onTertiaryContainer: Color(0xFFCCEBC3),
    error: Color(0xFFFFB4AB),
    onError: Color(0xFF690005),
    errorContainer: Color(0xFF93000A),
    onErrorContainer: Color(0xFFFFDAD6),
    surface: Color(0xFF1C1B1F), // Near black
    onSurface: Color(0xFFE6E1E5),
    surfaceContainerHighest: Color(0xFF36343B),
    onSurfaceVariant: Color(0xFFCAC4D0),
    outline: Color(0xFF938F99),
    outlineVariant: Color(0xFF49454F),
    shadow: Color(0xFF000000),
    scrim: Color(0xFF000000),
    inverseSurface: Color(0xFFE6E1E5),
    onInverseSurface: Color(0xFF313033),
    inversePrimary: Color(0xFF3D5A80),
  );
}
