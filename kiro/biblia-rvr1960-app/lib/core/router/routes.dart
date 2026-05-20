/// Route path constants for the Biblia RVR1960 app.
///
/// All route paths are defined here as constants to avoid magic strings
/// throughout the codebase. Routes are organized by feature.
///
/// Validates: Requirements 12.3, 11.4
abstract final class AppRoutes {
  // --- Bottom navigation destinations ---

  /// Home screen (verse of the day, continue reading, shortcuts).
  static const String home = '/';

  /// Bible book selector screen (OT/NT tabs).
  static const String bible = '/bible';

  /// Bible reader screen with book and chapter parameters.
  /// Parameters: bookId (int), chapter (int).
  static const String reader = '/bible/:bookId/:chapter';

  /// Search screen for full-text Bible search.
  static const String search = '/search';

  /// Settings screen (theme, font size, typeface).
  static const String settings = '/settings';

  // --- Push routes (not in bottom navigation) ---

  /// Favorites list screen.
  static const String favorites = '/favorites';

  /// Notes list screen.
  static const String notes = '/notes';

  // --- Helper methods for parameterized routes ---

  /// Builds the reader path with the given [bookId] and [chapter].
  static String readerPath(int bookId, int chapter) =>
      '/bible/$bookId/$chapter';
}
