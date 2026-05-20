import 'package:flutter/material.dart';

import '../../../../core/error/app_error.dart';
import '../../domain/entities/theme_settings.dart';
import '../../domain/repositories/settings_repository.dart';
import '../datasources/settings_local_datasource.dart';

/// Concrete implementation of [SettingsRepository].
///
/// Validates all settings values before persisting and provides
/// sensible defaults when no settings have been saved:
/// - Theme mode: system
/// - Font size: 16sp
/// - Typeface: sansSerif
class SettingsRepositoryImpl implements SettingsRepository {
  /// Valid font sizes: 14, 16, 18, 20, 22, 24, 26, 28.
  static const int minFontSize = 14;
  static const int maxFontSize = 28;
  static const int fontSizeIncrement = 2;

  /// Default settings applied on first launch.
  static const ThemeSettings defaultSettings = ThemeSettings(
    mode: ThemeMode.system,
    fontSize: 16,
    typeface: AppTypeface.sansSerif,
  );

  final SettingsLocalDataSource _dataSource;

  SettingsRepositoryImpl({
    required SettingsLocalDataSource dataSource,
  }) : _dataSource = dataSource;

  @override
  Future<Result<ThemeSettings>> getSettings() async {
    try {
      final settings = await _dataSource.loadSettings();
      if (settings == null) {
        return Result.success(defaultSettings);
      }
      return Result.success(settings);
    } catch (e) {
      return Result.failure(
        AppError.storage('Failed to load settings: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<void>> saveSettings(ThemeSettings settings) async {
    // Validate font size
    final fontSizeError = _validateFontSize(settings.fontSize);
    if (fontSizeError != null) {
      return Result.failure(fontSizeError);
    }

    // Validate typeface
    final typefaceError = _validateTypeface(settings.typeface);
    if (typefaceError != null) {
      return Result.failure(typefaceError);
    }

    try {
      await _dataSource.saveSettings(settings);
      return Result.success(null);
    } catch (e) {
      return Result.failure(
        AppError.storage('Failed to save settings: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<ThemeMode>> getThemeMode() async {
    try {
      final mode = await _dataSource.loadThemeMode();
      return Result.success(mode ?? ThemeMode.system);
    } catch (e) {
      return Result.failure(
        AppError.storage('Failed to load theme mode: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<int>> getFontSize() async {
    try {
      final fontSize = await _dataSource.loadFontSize();
      return Result.success(fontSize ?? 16);
    } catch (e) {
      return Result.failure(
        AppError.storage('Failed to load font size: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<AppTypeface>> getTypeface() async {
    try {
      final typeface = await _dataSource.loadTypeface();
      return Result.success(typeface ?? AppTypeface.sansSerif);
    } catch (e) {
      return Result.failure(
        AppError.storage('Failed to load typeface: ${e.toString()}'),
      );
    }
  }

  // --- Validation helpers ---

  /// Validates that the font size is within [14, 28] and is an even number
  /// (i.e., increments of 2 starting from 14).
  AppError? _validateFontSize(int fontSize) {
    if (fontSize < minFontSize || fontSize > maxFontSize) {
      return AppError.validation(
        'Font size must be between $minFontSize and $maxFontSize. '
        'Got: $fontSize',
      );
    }
    if ((fontSize - minFontSize) % fontSizeIncrement != 0) {
      return AppError.validation(
        'Font size must be in increments of $fontSizeIncrement '
        'starting from $minFontSize. Got: $fontSize',
      );
    }
    return null;
  }

  /// Validates that the typeface is one of the allowed values.
  /// Since [AppTypeface] is an enum, this is inherently safe, but we
  /// include it for completeness and future-proofing.
  AppError? _validateTypeface(AppTypeface typeface) {
    if (!AppTypeface.values.contains(typeface)) {
      return AppError.validation(
        'Invalid typeface: $typeface. '
        'Allowed values: ${AppTypeface.values.join(', ')}',
      );
    }
    return null;
  }
}
