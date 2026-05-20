import 'package:flutter/material.dart';

import '../../../../core/error/app_error.dart';
import '../entities/theme_settings.dart';

/// Abstract repository interface for theme and typography settings.
///
/// Defines the contract for persisting and retrieving user preferences
/// related to theme mode, font size, and typeface selection.
abstract class SettingsRepository {
  /// Retrieves the complete theme settings.
  ///
  /// Returns [ThemeSettings] with the user's saved preferences.
  /// If no settings have been saved, returns default settings:
  /// - Theme mode: system (or light if system unavailable)
  /// - Font size: 16sp
  /// - Typeface: sansSerif
  Future<Result<ThemeSettings>> getSettings();

  /// Saves the complete theme settings.
  ///
  /// Validates all values before persisting:
  /// - Font size must be between 14 and 28 (inclusive), in increments of 2
  /// - Typeface must be one of: serif, sansSerif, lora
  /// - Theme mode must be one of: light, dark, system
  Future<Result<void>> saveSettings(ThemeSettings settings);

  /// Retrieves only the theme mode setting.
  ///
  /// Returns [ThemeMode.system] if no preference has been saved.
  Future<Result<ThemeMode>> getThemeMode();

  /// Retrieves only the font size setting.
  ///
  /// Returns 16 if no preference has been saved.
  Future<Result<int>> getFontSize();

  /// Retrieves only the typeface setting.
  ///
  /// Returns [AppTypeface.sansSerif] if no preference has been saved.
  Future<Result<AppTypeface>> getTypeface();
}
