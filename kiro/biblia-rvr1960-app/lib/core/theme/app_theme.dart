import 'package:flutter/material.dart';

import '../../features/settings/domain/entities/theme_settings.dart';
import 'color_schemes.dart';
import 'typography.dart';

/// Builds complete [ThemeData] instances from color schemes and typography
/// settings, applying Material 3 design system throughout.
class AppTheme {
  AppTheme._();

  /// Builds a light [ThemeData] with the given font settings.
  static ThemeData light({
    double baseFontSize = 16,
    AppTypeface typeface = AppTypeface.sansSerif,
  }) {
    return _buildTheme(
      colorScheme: AppColorSchemes.lightScheme,
      baseFontSize: baseFontSize,
      typeface: typeface,
    );
  }

  /// Builds a dark [ThemeData] with the given font settings.
  static ThemeData dark({
    double baseFontSize = 16,
    AppTypeface typeface = AppTypeface.sansSerif,
  }) {
    return _buildTheme(
      colorScheme: AppColorSchemes.darkScheme,
      baseFontSize: baseFontSize,
      typeface: typeface,
    );
  }

  /// Resolves the appropriate [ThemeData] based on [ThemeSettings].
  ///
  /// For [ThemeMode.system], returns both light and dark themes to be used
  /// with [MaterialApp]'s theme/darkTheme properties.
  static ({ThemeData light, ThemeData dark}) fromSettings(
    ThemeSettings settings,
  ) {
    final fontSize = settings.fontSize.toDouble();
    final typeface = settings.typeface;

    return (
      light: light(baseFontSize: fontSize, typeface: typeface),
      dark: dark(baseFontSize: fontSize, typeface: typeface),
    );
  }

  /// Core theme builder that assembles [ThemeData] from a [ColorScheme]
  /// and typography configuration.
  static ThemeData _buildTheme({
    required ColorScheme colorScheme,
    required double baseFontSize,
    required AppTypeface typeface,
  }) {
    final textTheme = buildTextTheme(
      baseFontSize: baseFontSize,
      typeface: typeface,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      textTheme: textTheme,
      brightness: colorScheme.brightness,

      // AppBar theme
      appBarTheme: AppBarTheme(
        centerTitle: true,
        elevation: 0,
        scrolledUnderElevation: 2,
        backgroundColor: colorScheme.surface,
        foregroundColor: colorScheme.onSurface,
        titleTextStyle: textTheme.headlineMedium?.copyWith(
          color: colorScheme.onSurface,
          fontSize: baseFontSize + 2,
          fontWeight: FontWeight.w600,
        ),
      ),

      // Card theme
      cardTheme: CardThemeData(
        elevation: 2,
        shadowColor: colorScheme.shadow.withOpacity(0.1),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        clipBehavior: Clip.antiAlias,
        color: colorScheme.surface,
        surfaceTintColor: colorScheme.primary.withOpacity(0.05),
      ),

      // Elevated button theme
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 2,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: textTheme.labelMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // Filled button theme
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: textTheme.labelMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // Text button theme
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: textTheme.labelMedium,
        ),
      ),

      // Input decoration theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: colorScheme.surfaceContainerHighest.withOpacity(0.3),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: colorScheme.outline),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: colorScheme.outlineVariant),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: colorScheme.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: colorScheme.error),
        ),
        labelStyle: textTheme.bodySmall?.copyWith(
          color: colorScheme.onSurfaceVariant,
        ),
        hintStyle: textTheme.bodyLarge?.copyWith(
          color: colorScheme.onSurfaceVariant.withOpacity(0.6),
        ),
      ),

      // Bottom navigation bar theme
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        type: BottomNavigationBarType.fixed,
        elevation: 4,
        backgroundColor: colorScheme.surface,
        selectedItemColor: colorScheme.primary,
        unselectedItemColor: colorScheme.onSurfaceVariant,
        selectedLabelStyle: textTheme.labelMedium?.copyWith(
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: textTheme.labelMedium,
      ),

      // Navigation bar theme (Material 3)
      navigationBarTheme: NavigationBarThemeData(
        elevation: 3,
        backgroundColor: colorScheme.surface,
        indicatorColor: colorScheme.primaryContainer,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return textTheme.labelMedium?.copyWith(
              color: colorScheme.primary,
              fontWeight: FontWeight.w600,
            );
          }
          return textTheme.labelMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return IconThemeData(color: colorScheme.primary, size: 24);
          }
          return IconThemeData(color: colorScheme.onSurfaceVariant, size: 24);
        }),
      ),

      // Divider theme
      dividerTheme: DividerThemeData(
        color: colorScheme.outlineVariant.withOpacity(0.5),
        thickness: 1,
        space: 1,
      ),

      // Snackbar theme
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        backgroundColor: colorScheme.inverseSurface,
        contentTextStyle: textTheme.bodySmall?.copyWith(
          color: colorScheme.onInverseSurface,
        ),
      ),

      // Dialog theme
      dialogTheme: DialogThemeData(
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        backgroundColor: colorScheme.surface,
        titleTextStyle: textTheme.headlineMedium?.copyWith(
          color: colorScheme.onSurface,
          fontSize: baseFontSize + 2,
        ),
        contentTextStyle: textTheme.bodyLarge?.copyWith(
          color: colorScheme.onSurfaceVariant,
        ),
      ),
    );
  }
}
