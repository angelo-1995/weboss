/// Application-wide constants for limits, timeouts, and configuration values.
class AppConstants {
  AppConstants._();

  // --- Search Limits ---

  /// Maximum number of search results returned per query.
  static const int maxSearchResults = 100;

  /// Minimum number of characters required for a search query.
  static const int minSearchLength = 3;

  /// Maximum number of characters allowed in a search query.
  static const int maxSearchQueryLength = 100;

  /// Debounce duration for search input in milliseconds.
  static const int searchDebounceMs = 150;

  // --- Notes Limits ---

  /// Maximum number of characters allowed in a note.
  static const int maxNoteLength = 2000;

  /// Minimum number of characters required for a note.
  static const int minNoteLength = 1;

  // --- Favorites Limits ---

  /// Maximum number of favorites that can be stored.
  static const int maxFavorites = 1000;

  // --- Timeouts ---

  /// Database initialization timeout in seconds.
  static const int dbInitTimeoutSeconds = 30;

  /// Chapter load timeout in milliseconds.
  static const int chapterLoadTimeoutMs = 5000;

  /// Image generation timeout in milliseconds.
  static const int imageGenerationTimeoutMs = 2000;

  /// Home screen content load timeout in milliseconds.
  static const int homeScreenLoadTimeoutMs = 500;

  // --- UI Constants ---

  /// Minimum font size in sp.
  static const int minFontSize = 14;

  /// Maximum font size in sp.
  static const int maxFontSize = 28;

  /// Font size increment step in sp.
  static const int fontSizeStep = 2;

  /// Default font size in sp.
  static const int defaultFontSize = 16;

  /// Context characters shown around search match.
  static const int searchContextChars = 40;

  /// Maximum verse text length for display before truncation.
  static const int maxVerseDisplayLength = 500;

  /// Maximum verse text length before image font size reduction.
  static const int maxImageTextLength = 300;

  // --- Image Generation ---

  /// Image width in pixels.
  static const int imageWidth = 1080;

  /// Image height in pixels.
  static const int imageHeight = 1080;

  /// Watermark opacity (0.0 - 1.0).
  static const double watermarkOpacity = 0.30;

  /// Watermark text.
  static const String watermarkText = 'RVR1960';

  // --- Performance ---

  /// Maximum screens of verse widgets in render tree.
  static const int maxRenderScreens = 3;

  /// Target frame rate for scrolling.
  static const int targetFrameRate = 60;

  /// Skeleton loader display threshold in milliseconds.
  static const int skeletonLoaderThresholdMs = 300;

  // --- Verse of the Day ---

  /// Minimum pool size for verse of the day selection.
  static const int minVotdPoolSize = 365;
}
