import '../../../../core/constants/app_constants.dart';

/// Represents the verse of the day with display and share formatting.
///
/// Contains the full verse text, book name, chapter, and verse number.
/// Provides [displayText] which is truncated to 500 characters with ellipsis
/// if the full text exceeds that limit, and [fullText] which always contains
/// the complete untruncated verse text for sharing.
class VerseOfDay {
  /// Creates a [VerseOfDay] instance.
  ///
  /// The [displayText] is automatically computed from [verseText]:
  /// - If [verseText] is <= 500 characters, [displayText] equals [verseText]
  /// - If [verseText] is > 500 characters, [displayText] is truncated to 500
  ///   characters followed by "..."
  VerseOfDay({
    required this.verseText,
    required this.bookName,
    required this.chapter,
    required this.verse,
    required this.bookId,
  })  : fullText = verseText,
        displayText = verseText.length > AppConstants.maxVerseDisplayLength
            ? '${verseText.substring(0, AppConstants.maxVerseDisplayLength)}...'
            : verseText;

  /// The complete verse text as stored in the Bible database.
  final String verseText;

  /// The book name in Spanish (e.g., "Salmos", "Juan", "Romanos").
  final String bookName;

  /// The chapter number (1-based).
  final int chapter;

  /// The verse number (1-based).
  final int verse;

  /// The canonical book ID (1-66).
  final int bookId;

  /// The display-formatted text, truncated with "..." if > 500 characters.
  ///
  /// Used for rendering on the Home Screen where space is limited.
  final String displayText;

  /// The full untruncated verse text.
  ///
  /// Used for sharing and navigation — always contains the complete text
  /// regardless of length.
  final String fullText;

  /// Returns the formatted reference string (e.g., "Juan 3:16").
  String get reference => '$bookName $chapter:$verse';

  /// Returns the share text including verse, reference, and attribution.
  String get shareText => '$fullText\n\n$reference\n— RVR1960';

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is VerseOfDay &&
          runtimeType == other.runtimeType &&
          bookId == other.bookId &&
          chapter == other.chapter &&
          verse == other.verse &&
          verseText == other.verseText;

  @override
  int get hashCode =>
      bookId.hashCode ^ chapter.hashCode ^ verse.hashCode ^ verseText.hashCode;

  @override
  String toString() =>
      'VerseOfDay(reference: $reference, displayText: ${displayText.length > 50 ? '${displayText.substring(0, 50)}...' : displayText})';
}
