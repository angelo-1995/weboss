/// Utility class for normalizing Spanish text.
///
/// Handles accent removal, lowercase conversion, and ensures
/// idempotent behavior (normalizing already-normalized text returns same result).
class TextNormalizer {
  TextNormalizer._();

  /// Map of accented characters to their unaccented equivalents.
  static const Map<String, String> _accentMap = {
    'á': 'a',
    'é': 'e',
    'í': 'i',
    'ó': 'o',
    'ú': 'u',
    'ñ': 'n',
    'ü': 'u',
    'Á': 'a',
    'É': 'e',
    'Í': 'i',
    'Ó': 'o',
    'Ú': 'u',
    'Ñ': 'n',
    'Ü': 'u',
  };

  /// Normalizes text by converting to lowercase and removing Spanish diacritics.
  ///
  /// This operation is idempotent: calling normalize on already-normalized text
  /// returns the same result.
  ///
  /// Examples:
  /// - "Génesis" → "genesis"
  /// - "Jesús" → "jesus"
  /// - "señor" → "senor"
  /// - "bilingüe" → "bilingue"
  static String normalize(String text) {
    final buffer = StringBuffer();
    final lowered = text.toLowerCase();

    for (int i = 0; i < lowered.length; i++) {
      final char = lowered[i];
      buffer.write(_accentMap[char] ?? char);
    }

    return buffer.toString();
  }

  /// Removes only accents/diacritics without changing case.
  static String removeAccents(String text) {
    final buffer = StringBuffer();

    for (int i = 0; i < text.length; i++) {
      final char = text[i];
      buffer.write(_accentMap[char] ?? char);
    }

    return buffer.toString();
  }
}
