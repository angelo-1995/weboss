import 'package:flutter/material.dart';

/// Available typeface options for the reading experience.
enum AppTypeface { serif, sansSerif, lora }

/// An immutable representation of the user's theme preferences.
class ThemeSettings {
  const ThemeSettings({
    this.mode = ThemeMode.system,
    this.fontSize = 16,
    this.typeface = AppTypeface.sansSerif,
  });

  /// The theme mode (light, dark, or system).
  final ThemeMode mode;

  /// The base font size in sp.
  final int fontSize;

  /// The selected typeface for reading content.
  final AppTypeface typeface;

  /// Creates a copy of this settings with the given fields replaced.
  ThemeSettings copyWith({
    ThemeMode? mode,
    int? fontSize,
    AppTypeface? typeface,
  }) {
    return ThemeSettings(
      mode: mode ?? this.mode,
      fontSize: fontSize ?? this.fontSize,
      typeface: typeface ?? this.typeface,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ThemeSettings &&
          mode == other.mode &&
          fontSize == other.fontSize &&
          typeface == other.typeface;

  @override
  int get hashCode => Object.hash(mode, fontSize, typeface);

  @override
  String toString() =>
      'ThemeSettings(mode: $mode, fontSize: $fontSize, typeface: $typeface)';
}
