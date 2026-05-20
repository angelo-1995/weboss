import 'package:flutter/material.dart';
import 'package:hive/hive.dart';

import '../../domain/entities/theme_settings.dart';

/// Data source for persisting and retrieving theme and typography settings.
///
/// Uses the `preferences_box` Hive box to store settings as
/// individual key-value pairs:
/// - `theme_mode` (String): 'light', 'dark', or 'system'
/// - `font_size` (int): Font size in sp (14-28, increments of 2)
/// - `typeface` (String): 'serif', 'sansSerif', or 'lora'
abstract class SettingsLocalDataSource {
  /// Saves the current theme settings to local storage.
  Future<void> saveSettings(ThemeSettings settings);

  /// Loads the saved theme settings.
  ///
  /// Returns `null` if no settings have been saved yet.
  Future<ThemeSettings?> loadSettings();

  /// Saves only the theme mode.
  Future<void> saveThemeMode(ThemeMode mode);

  /// Loads only the theme mode.
  ///
  /// Returns `null` if no theme mode has been saved.
  Future<ThemeMode?> loadThemeMode();

  /// Saves only the font size.
  Future<void> saveFontSize(int fontSize);

  /// Loads only the font size.
  ///
  /// Returns `null` if no font size has been saved.
  Future<int?> loadFontSize();

  /// Saves only the typeface.
  Future<void> saveTypeface(AppTypeface typeface);

  /// Loads only the typeface.
  ///
  /// Returns `null` if no typeface has been saved.
  Future<AppTypeface?> loadTypeface();

  /// Clears all saved settings.
  Future<void> clearSettings();
}

/// Concrete implementation of [SettingsLocalDataSource] using Hive.
///
/// Stores theme settings in the `preferences_box` as individual keys
/// for efficient partial reads and writes.
class SettingsLocalDataSourceImpl implements SettingsLocalDataSource {
  static const String preferencesBoxName = 'preferences_box';

  // Storage keys
  static const String keyThemeMode = 'theme_mode';
  static const String keyFontSize = 'font_size';
  static const String keyTypeface = 'typeface';

  final Box<dynamic> _preferencesBox;

  SettingsLocalDataSourceImpl({
    required Box<dynamic> preferencesBox,
  }) : _preferencesBox = preferencesBox;

  @override
  Future<void> saveSettings(ThemeSettings settings) async {
    await _preferencesBox.put(keyThemeMode, _themeModeToString(settings.mode));
    await _preferencesBox.put(keyFontSize, settings.fontSize);
    await _preferencesBox.put(keyTypeface, _typefaceToString(settings.typeface));
  }

  @override
  Future<ThemeSettings?> loadSettings() async {
    final modeStr = _preferencesBox.get(keyThemeMode) as String?;
    final fontSize = _preferencesBox.get(keyFontSize) as int?;
    final typefaceStr = _preferencesBox.get(keyTypeface) as String?;

    // If no settings have been saved yet, return null.
    if (modeStr == null && fontSize == null && typefaceStr == null) {
      return null;
    }

    return ThemeSettings(
      mode: modeStr != null ? _stringToThemeMode(modeStr) : ThemeMode.system,
      fontSize: fontSize ?? 16,
      typeface: typefaceStr != null
          ? _stringToTypeface(typefaceStr)
          : AppTypeface.sansSerif,
    );
  }

  @override
  Future<void> saveThemeMode(ThemeMode mode) async {
    await _preferencesBox.put(keyThemeMode, _themeModeToString(mode));
  }

  @override
  Future<ThemeMode?> loadThemeMode() async {
    final modeStr = _preferencesBox.get(keyThemeMode) as String?;
    if (modeStr == null) return null;
    return _stringToThemeMode(modeStr);
  }

  @override
  Future<void> saveFontSize(int fontSize) async {
    await _preferencesBox.put(keyFontSize, fontSize);
  }

  @override
  Future<int?> loadFontSize() async {
    return _preferencesBox.get(keyFontSize) as int?;
  }

  @override
  Future<void> saveTypeface(AppTypeface typeface) async {
    await _preferencesBox.put(keyTypeface, _typefaceToString(typeface));
  }

  @override
  Future<AppTypeface?> loadTypeface() async {
    final typefaceStr = _preferencesBox.get(keyTypeface) as String?;
    if (typefaceStr == null) return null;
    return _stringToTypeface(typefaceStr);
  }

  @override
  Future<void> clearSettings() async {
    await _preferencesBox.delete(keyThemeMode);
    await _preferencesBox.delete(keyFontSize);
    await _preferencesBox.delete(keyTypeface);
  }

  // --- Conversion helpers ---

  String _themeModeToString(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.light:
        return 'light';
      case ThemeMode.dark:
        return 'dark';
      case ThemeMode.system:
        return 'system';
    }
  }

  ThemeMode _stringToThemeMode(String value) {
    switch (value) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      case 'system':
      default:
        return ThemeMode.system;
    }
  }

  String _typefaceToString(AppTypeface typeface) {
    switch (typeface) {
      case AppTypeface.serif:
        return 'serif';
      case AppTypeface.sansSerif:
        return 'sansSerif';
      case AppTypeface.lora:
        return 'lora';
    }
  }

  AppTypeface _stringToTypeface(String value) {
    switch (value) {
      case 'serif':
        return AppTypeface.serif;
      case 'lora':
        return AppTypeface.lora;
      case 'sansSerif':
      default:
        return AppTypeface.sansSerif;
    }
  }
}
