import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_error.dart';
import '../../domain/entities/theme_settings.dart';
import '../../domain/repositories/settings_repository.dart';

/// Overridable provider for the [SettingsRepository] instance.
///
/// Must be overridden in the app's [ProviderScope] with a concrete
/// implementation (e.g., [SettingsRepositoryImpl]).
final settingsRepositoryProvider = Provider<SettingsRepository>((ref) {
  throw UnimplementedError(
    'settingsRepositoryProvider must be overridden with a concrete '
    'SettingsRepository implementation.',
  );
});

/// Manages theme and typography settings state.
///
/// Loads settings from the repository on initialization and exposes
/// methods to change theme mode, font size, and typeface. Each change
/// immediately updates the state and auto-saves to the repository.
class ThemeNotifier extends StateNotifier<ThemeSettings> {
  final SettingsRepository _repository;

  ThemeNotifier(this._repository) : super(const ThemeSettings()) {
    _loadSettings();
  }

  /// Loads persisted settings from the repository.
  ///
  /// If loading fails or no settings exist, keeps the default state.
  Future<void> _loadSettings() async {
    final result = await _repository.getSettings();
    switch (result) {
      case Success(data: final settings):
        state = settings;
      case Failure():
        // Keep default settings on failure
        break;
    }
  }

  /// Changes the theme mode (light, dark, or system).
  ///
  /// Immediately updates state and persists to storage.
  Future<void> setThemeMode(ThemeMode mode) async {
    state = state.copyWith(mode: mode);
    await _repository.saveSettings(state);
  }

  /// Changes the font size.
  ///
  /// Valid values: 14, 16, 18, 20, 22, 24, 26, 28.
  /// Immediately updates state and persists to storage.
  Future<void> setFontSize(int fontSize) async {
    // Clamp to valid range and snap to even increments
    final clamped = fontSize.clamp(14, 28);
    final snapped = ((clamped - 14) ~/ 2) * 2 + 14;
    state = state.copyWith(fontSize: snapped);
    await _repository.saveSettings(state);
  }

  /// Changes the typeface.
  ///
  /// Immediately updates state and persists to storage.
  Future<void> setTypeface(AppTypeface typeface) async {
    state = state.copyWith(typeface: typeface);
    await _repository.saveSettings(state);
  }
}

/// Global provider for theme and typography settings.
///
/// Watches [settingsRepositoryProvider] and provides a [ThemeNotifier]
/// that manages the current [ThemeSettings] state.
final themeProvider =
    StateNotifierProvider<ThemeNotifier, ThemeSettings>((ref) {
  final repository = ref.watch(settingsRepositoryProvider);
  return ThemeNotifier(repository);
});
