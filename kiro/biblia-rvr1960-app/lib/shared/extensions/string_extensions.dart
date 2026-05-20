import 'package:biblia_rvr1960/core/utils/text_normalizer.dart';

/// Extension methods on [String] for common text operations.
extension StringExtensions on String {
  /// Capitalizes the first letter of the string.
  ///
  /// Example: "hello" → "Hello"
  String get capitalize {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }

  /// Capitalizes the first letter of each word.
  ///
  /// Example: "hello world" → "Hello World"
  String get capitalizeWords {
    if (isEmpty) return this;
    return split(' ').map((word) => word.capitalize).join(' ');
  }

  /// Truncates the string to [maxLength] and appends an ellipsis if needed.
  ///
  /// Example: "Hello World".truncateWithEllipsis(5) → "Hello..."
  String truncateWithEllipsis(int maxLength) {
    if (length <= maxLength) return this;
    return '${substring(0, maxLength)}...';
  }

  /// Removes leading and trailing whitespace and collapses internal whitespace.
  ///
  /// Example: "  hello   world  " → "hello world"
  String get collapseWhitespace {
    return trim().replaceAll(RegExp(r'\s+'), ' ');
  }

  /// Returns the normalized version of this string (lowercase, no accents).
  String get normalized => TextNormalizer.normalize(this);

  /// Returns the string with accents removed but case preserved.
  String get withoutAccents => TextNormalizer.removeAccents(this);

  /// Returns true if the string is blank (empty or only whitespace).
  bool get isBlank => trim().isEmpty;

  /// Returns true if the string is not blank.
  bool get isNotBlank => !isBlank;

  /// Returns null if the string is blank, otherwise returns the string.
  String? get nullIfBlank => isBlank ? null : this;

  /// Converts the string to a format suitable for use as a Hive key.
  ///
  /// Example: "Génesis 1:1" → "genesis_1_1"
  String get toHiveKey {
    return normalized
        .replaceAll(RegExp(r'[^a-z0-9]'), '_')
        .replaceAll(RegExp(r'_+'), '_')
        .trim();
  }
}
